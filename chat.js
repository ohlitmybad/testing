const REMOTE_QUOTA_URL = 'https://script.google.com/macros/s/AKfycbweT-ZkpblVyID3npNRRCTvJISREBxCtCkmW3JU_tEquUpE_XPI9ZnE6NkefHjBv17icg/exec';

// Everyday analyst model: strong code-interpreter + instruction following
// without flagship latency. Fall back if the account cannot use a candidate.
const ANALYST_MODEL_CANDIDATES = ['gpt-5.6-terra', 'gpt-5.6', 'gpt-4.1', 'gpt-4o'];
const ANALYST_MODEL = ANALYST_MODEL_CANDIDATES[0];
const DATASET_FILE_NAMES = {
    data: 'data.csv',
    guide: 'guide.html'
};
const DATASET_FILE_CACHE_KEY = 'datamb_dataset_file_ids_v1';
const DATASET_FILE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// Used only on non-reasoning fallbacks (gpt-4.1 / gpt-4o). Reasoning
// models reject temperature/top_p — they are steered with reasoning.effort.
const ANALYST_TEMPERATURE = 0.2;
const ANALYST_TOP_P = 0.9;
const PLAYER_CHOICE_TOOL = 'present_player_choices';

function isReasoningModel(model) {
    return /^(gpt-5|gpt-6|o[1-9])/i.test(String(model || ''));
}

function __jsonp(url, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
        const cb = 'cb' + Math.random().toString(36).slice(2);
        const s = document.createElement('script');
        const t = setTimeout(() => { cleanup(); reject(new Error('JSONP timeout')); }, timeoutMs);
        function cleanup(){ if (s.parentNode) s.parentNode.removeChild(s); try{ delete window[cb]; }catch(_){ window[cb]=undefined; } clearTimeout(t);} 
        window[cb] = (data) => { cleanup(); resolve(data); };
        s.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + cb;
        s.onerror = () => { cleanup(); reject(new Error('JSONP error')); };
        document.head.appendChild(s);
    });
}

async function remoteGetQuota(memberId) {
    if (!REMOTE_QUOTA_URL) throw new Error('REMOTE_QUOTA_URL not set');
    return __jsonp(REMOTE_QUOTA_URL + '?id=' + encodeURIComponent(memberId));
}

async function remoteBumpQuota(memberId) {
    if (!REMOTE_QUOTA_URL) throw new Error('REMOTE_QUOTA_URL not set');
    return __jsonp(REMOTE_QUOTA_URL + '?id=' + encodeURIComponent(memberId) + '&bump=1');
}

class UltimateFootballAI {
    constructor() {
        this.acTo = null;
        
        const bootstrapUrlc2 = 'aHR0cHM6Ly93b3JrZXJzLXBsYXlncm91bmQtbGluZ2VyaW5nLWRpc2stMWFhNi5kYXRhbWItZm9vdGJhbGwud29ya2Vycy5kZXYvP3Rva2VuPXN1cGVyc2VjcmV0';

        this.bootstrapPromise = fetch(atob(bootstrapUrlc2))
            .then(r => r.json())
            .then(data => {
                this.acTo = data.key; 
                this.acToAdj = this.getAdjusted();
                return this.acTo;
            });

        this.conversationId = null;
        this.containerId = null;
        this.currentResponseId = null;
        this.instructions = '';
        this.model = ANALYST_MODEL;
        this.modelCandidates = ANALYST_MODEL_CANDIDATES.slice();
        try {
            const saved = sessionStorage.getItem('datamb_analyst_model');
            if (saved && this.modelCandidates.includes(saved)) this.model = saved;
        } catch (_) {}
        this.dataFileIds = [];
        this.isInitialized = false;
        this.initPromise = null;
        this.chartsEnabled = false;
        this.replyTo = null;
        this.messageSeq = 0;
        this.liveAssistant = null;
        this.pendingPlayerCall = null;

        // Blob URLs for rendered charts. Held until the transcript is cleared,
        // then revoked so the underlying image data can be freed.
        this.chartObjectUrls = [];
        // Charts already rendered in this conversation (dedupe only).
        this.shownChartKeys = new Set();

        
        // MONTHLY QUOTA SYSTEM - 30 QUERIES IN 30 DAYS
        this.MONTHLY_LIMIT = 30;
        this.mwKeyApplied = false;
        this.currentMemberId = '';
        
        // LOCAL CACHE FOR INSTANT UX (mirrors Google Script data)
        this.quotaCache = {}; // In-memory cache for instant checks

        this.messagesContainer = document.getElementById('messages');
        if (this.messagesContainer) this.messagesContainer.innerHTML = '';
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chartToggle = document.getElementById('chartToggle');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.isSending = false;
        this.fetchController = null;
        this.cancelRequested = false;
        this.status = document.getElementById('status');
        this.suggestions = document.getElementById('suggestions');
        this.defaultSuggestionsHTML = this.suggestions ? this.suggestions.innerHTML : '';
        this.suggestionTimer = null;
        this.scrollQueued = false;
        this.lastStatusHTML = '';

        if (window.marked) {
            marked.setOptions({ gfm: true, breaks: true });
        }

        if (this.chartsEnabled) {
            this.chartToggle.classList.add('active');
        } else {
            this.chartToggle.classList.remove('active');
        }

        this.setupEventListeners();
        this.setupQuotaTooltip();
        this.initialize();
    }

    getAdjusted() {
        const original = this.acTo || '';
        for (let i = original.length - 1; i >= 0; i--) {
            const ch = original[i];
            if (ch >= '0' && ch <= '9') {
                const incremented = (Number(ch) + 1) % 10;
                return original.slice(0, i) + String(incremented) + original.slice(i + 1);
            }
        }
        return original;
    }

    computeResetAtFromQuotaData(data) {
        // Backend already handles reset logic - just use the start timestamp
        if (Number.isFinite(Number(data && data.start))) {
            const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
            return Number(data.start) + THIRTY_DAYS_MS;
        }
        return null;
    }

    
    formatResetDate(ts) {
        try {
            const d = new Date(Number(ts));
            if (!Number.isFinite(d.getTime())) return '';
            // Force European date format: DD.MM.YY HH:MM
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear().toString().slice(-2);
            const hours = d.getHours().toString().padStart(2, '0');
            const minutes = d.getMinutes().toString().padStart(2, '0');
            return `${day}.${month}.${year} ${hours}:${minutes}`;
        } catch (_) { return ''; }
    }

    saveQuotaCache(memberId, data) {
        // Calculate reset date once and store it
        const resetAt = this.computeResetAtFromQuotaData(data);
        
        this.quotaCache[memberId] = {
            start: Number(data.start || Date.now()),
            count: Number(data.count || 0),
            extendedQuota: Number(data.extendedQuota || 0),
            resetAt: resetAt
        };
    }

    getQuotaCache(memberId) {
        return this.quotaCache[memberId] || null;
    }

    async preloadRemoteQuotaForId(memberId) {
        if (!memberId) return;

        // Always clear cache first to force fresh data
        this.quotaCache[memberId] = null;

        try {
            const data = await remoteGetQuota(memberId);
            this.saveQuotaCache(memberId, data);
            // Only refresh Ready when setup is done — otherwise this races init
            // and flashes Ready between "Loading AI assistant" and "Setting up…".
            if (this.isInitialized) {
                this.updateStatus('Ready!', 'ready');
            }
        } catch (e) {
        }
    }


    canSendNow() {
        // Must be logged in
        if (!(this.mwKeyApplied && this.currentMemberId)) {
            this.showError('You must be logged in');
            this.updateStatus('Login required', 'error');
            return false;
        }

        // Check cached quota for instant blocking
        const cached = this.getQuotaCache(this.currentMemberId);
        if (cached) {
            // Calculate total available quota including extended quota
            let totalLimit = this.MONTHLY_LIMIT;
            if (cached.extendedQuota && cached.extendedQuota > 0) {
                // Extended quota doesn't expire - always add it
                totalLimit += cached.extendedQuota;
            }
            
            if (cached.count >= totalLimit) {
                this.showMonthlyLimitError(cached.resetAt || null);
                const t = window.currentTranslations || null;
                
                // Check if this is a banned user (count: 999)
                const isBannedUser = cached.count === 999;
                
                if (isBannedUser) {
                    // For banned users, show "No access" with 0/0 quota
                    const statusText = (t?.status?.noAccess || 'No access') + ' <span class="status-separator">|</span> <span class="quota-display" data-used="0" data-total="0" data-remaining="0" data-reset="">0 <i class="fas fa-bolt"></i></span>';
                    this.updateStatus(statusText, 'error');
                } else {
                    // Regular monthly limit reached
                    const quotaText = this.getQuotaDisplayText();
                    const statusText = (t?.status?.monthlyLimitReached || 'Monthly limit reached') + (quotaText ? ' <span class="status-separator">|</span>' + quotaText : '');
                    this.updateStatus(statusText, 'error');
                }
                return false;
            }
        }

        return true; // Allow if no cache (optimistic) or under limit
    }

    async bumpQuotaAsync() {
        if (!(this.mwKeyApplied && this.currentMemberId)) return;
        
        try {
            const data = await remoteBumpQuota(this.currentMemberId);
            this.saveQuotaCache(this.currentMemberId, data);
        } catch (e) {
            const cached = this.getQuotaCache(this.currentMemberId);
            if (cached) {
                cached.count += 1;
            }
        }
    }

    // Compose and show the monthly limit error using i18n fragments if available
    showMonthlyLimitError(resetAt) {
        const t = window.currentTranslations || null;
        
        // Check if this is a banned user (they have count: 999)
        const cached = this.getQuotaCache(this.currentMemberId);
        const isBannedUser = cached && cached.count === 999;
        
        if (isBannedUser) {
            // Show banned user message
            const errorText = t?.errors?.bannedUser || 'Free accounts do not get AI access, create a new account to try DataMB Chat.';
            const subscribeLink = `<a href="https://datamb.football/join" target="_blank" class="payment-link">${t?.payment?.subscribe || 'Subscribe'}</a>`;
            
            const errorHTML = `
                <div class="error">
                    ${errorText}
                </div>
                ${subscribeLink}
            `;
            
            const errorMessage = this.createMessageContainer('assistant');
            const contentDiv = errorMessage.querySelector('.message-content');
            contentDiv.innerHTML = errorHTML;
            return;
        }
        
        // Regular monthly limit reached message
        const resetDate = resetAt ? this.formatResetDate(resetAt) : null;
        const errorText = t?.errors?.monthlyLimitReached || 'Monthly query limit reached.';
        const resetInfo = resetDate ? ` ${t?.errors?.resets || 'Resets'} ${resetDate}.` : '';
        
        const finalErrorText = `${errorText}${resetInfo} <br>You can add 100 requests if you don't want to wait.`;
        
        const paymentLink = `<a href="https://buy.stripe.com/bJe00jebp5sH7pl37rcbC0b" target="_blank" class="payment-link" onclick="clearCacheAndShowReload()">${t?.payment?.addMoreRequests || 'Buy (€10)'}</a>`;
        
        const errorHTML = `
            <div class="error">
                ${finalErrorText}
            </div>
            ${paymentLink}
        `;
        
        const errorMessage = this.createMessageContainer('assistant');
        const contentDiv = errorMessage.querySelector('.message-content');
        contentDiv.innerHTML = errorHTML;
    }


            setupEventListeners() {
                this.sendButton.addEventListener('click', () => {
                    if (this.currentResponseId || this.isSending) {
                        this.stopRequest();
                    } else {
                        this.sendMessage();
                    }
                });
                this.messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendMessage();
                    }
                });
                this.messageInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.replyTo) {
                        this.clearReply();
                    }
                });

                this.messageInput.addEventListener('input', (e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                    this.updateContextualSuggestions(e.target.value);
                });

                // Chart toggle
                this.chartToggle.addEventListener('click', () => this.toggleCharts());
                if (this.newChatBtn) this.newChatBtn.addEventListener('click', () => this.newChat());

                // Suggestion clicks
                this.suggestions.addEventListener('click', (e) => {
                    const chip = e.target.closest('.suggestion-chip');
                    if (!chip) return;
                    const query = chip.getAttribute('data-query') || '';
                    this.messageInput.value = query;
                    // Turn charts ON for certain suggestion chips
                    const qLower = query.toLowerCase();
                    const shouldEnableCharts = (
                        qLower.includes('radar') ||
                        qLower.includes('radar chart') ||
                        qLower.includes('scatter plot') ||
                        qLower.includes('plot') ||
                        qLower.includes('bar chart') ||
                        qLower.includes('heatmap') ||
                        qLower.includes('visual') ||
                        qLower.includes('age vs performance') ||
                        qLower.includes('xg vs goals') ||
                        (qLower.includes('xg') && qLower.includes('goals'))
                    );
                    if (shouldEnableCharts && !this.chartsEnabled) {
                        this.toggleCharts();
                    }
                    // Re-apply autosize and show caret at end
                    this.messageInput.style.height = 'auto';
                    this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 150) + 'px';
                    this.messageInput.focus();
                    const len = this.messageInput.value.length;
                    this.messageInput.setSelectionRange(len, len);
                });

                window.chatbot = this;
                this.ensureReplyBar();

                this.messagesContainer.addEventListener('click', (e) => {
                    const replyBtn = e.target.closest('[data-reply-to]');
                    if (replyBtn) {
                        const messageEl = replyBtn.closest('.message');
                        if (messageEl) this.startReplyTo(messageEl);
                        return;
                    }
                    const option = e.target.closest('.player-option');
                    if (option && !option.classList.contains('disabled')) {
                        this.handlePlayerChoice(option);
                    }
                });

                // The membership widget may have resolved the member's identity
                // before this instance existed; pick it up now.
                if (typeof window.__drainPendingUserKey === 'function') {
                    try { window.__drainPendingUserKey(); } catch (_) {}
                }
            }

            // Debounced so typing does not rebuild the chip row on every keystroke.
            updateContextualSuggestions(input) {
                clearTimeout(this.suggestionTimer);
                this.suggestionTimer = setTimeout(() => {
                    const suggestions = input.length < 3 ? [] : this.generateSmartSuggestions(input);
                    this.renderSuggestions(suggestions);
                }, 150);
            }

            generateSmartSuggestions(input) {
                const lowerInput = input.toLowerCase();

                if (lowerInput.includes('compare')) {
                    return [{
                        text: 'vs Analysis',
                        query: 'Compare their key stats with percentiles and visualizations'
                    }];
                }
                if (lowerInput.includes('best') || lowerInput.includes('top')) {
                    return [{
                        text: 'With Charts',
                        query: input + ' and create a visualization'
                    }];
                }
                return [];
            }

            escapeHTML(value) {
                return String(value == null ? '' : value)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            }

            renderSuggestions(suggestions) {
                if (!this.suggestions) return;

                // Restore the original chips instead of leaving the row empty.
                const html = suggestions.length
                    ? suggestions.map(s =>
                        `<div class="suggestion-chip" data-query="${this.escapeHTML(s.query)}"><i class="fas fa-wand-magic-sparkles"></i><span>${this.escapeHTML(s.text)}</span></div>`
                    ).join('')
                    : this.defaultSuggestionsHTML;

                if (this.suggestions.innerHTML !== html) {
                    this.suggestions.innerHTML = html;
                }
            }

            toggleCharts() {
                        this.chartsEnabled = !this.chartsEnabled;
                
                if (this.chartsEnabled) {
                    this.chartToggle.classList.add('active');
                    this.chartToggle.querySelector('.toggle-text').textContent = 'ON';
                    this.chartToggle.setAttribute('data-i18n', 'tooltips.chartsEnabled');
                    this.chartToggle.setAttribute('data-i18n-attr', 'title');
                    window.translateElement && window.translateElement(this.chartToggle, window.currentTranslations);
                } else {
                    this.chartToggle.classList.remove('active');
                    this.chartToggle.querySelector('.toggle-text').textContent = 'OFF';
                    this.chartToggle.setAttribute('data-i18n', 'tooltips.chartsDisabled');
                    this.chartToggle.setAttribute('data-i18n-attr', 'title');
                    window.translateElement && window.translateElement(this.chartToggle, window.currentTranslations);
                }
                
                // Show brief feedback
                const status = this.chartsEnabled ? 'Charts: ON' : 'Charts: OFF';
                this.updateStatus(status, this.chartsEnabled ? 'ready' : 'loading');
                setTimeout(() => {
                    if (this.isInitialized) {
                        this.updateStatus('Ready!', 'ready');
                    }
                }, 1500);
            }

            openaiHeaders(includeJson) {
                const headers = {
                    'Authorization': `Bearer ${this.acToAdj}`
                };
                if (includeJson) headers['Content-Type'] = 'application/json';
                return headers;
            }

            t(path, fallback) {
                try {
                    const translations = window.currentTranslations;
                    if (!translations) return fallback;
                    let value = translations;
                    for (const key of String(path).split('.')) {
                        if (value == null) return fallback;
                        value = value[key];
                    }
                    return (typeof value === 'string' && value) ? value : fallback;
                } catch (_) {
                    return fallback;
                }
            }

            async loadInstructions() {
                const response = await fetch('./instructions.txt', {
                    signal: (this.fetchController && this.fetchController.signal) || undefined
                });
                if (!response.ok) {
                    throw new Error(`Failed to load instructions (${response.status})`);
                }
                const text = await response.text();
                this.instructions = String(text || '').replace(/^\s*\{\{CHANGE FILE IDS\}\}\s*/m, '').trim();
                if (!this.instructions) {
                    throw new Error('Instructions file is empty');
                }
            }

            pickLatestFile(files, filename) {
                const matches = (files || []).filter(f =>
                    String(f.filename || '').toLowerCase() === String(filename).toLowerCase()
                );
                if (!matches.length) return null;
                return matches.reduce((latest, current) =>
                    (current.created_at || 0) > (latest.created_at || 0) ? current : latest
                );
            }

            async listOpenAIFiles(stopWhen) {
                const files = [];
                let after = null;
                for (let page = 0; page < 20; page++) {
                    const params = new URLSearchParams({ limit: '100', order: 'desc' });
                    if (after) params.set('after', after);
                    const response = await fetch(`https://api.openai.com/v1/files?${params.toString()}`, {
                        headers: this.openaiHeaders(false),
                        signal: (this.fetchController && this.fetchController.signal) || undefined
                    });
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(`File list failed: ${errorData.error?.message || response.statusText}`);
                    }
                    const data = await response.json();
                    const batch = data.data || [];
                    files.push(...batch);
                    if (typeof stopWhen === 'function' && stopWhen(files)) break;
                    if (!data.has_more || !batch.length) break;
                    after = batch[batch.length - 1].id;
                }
                return files;
            }

            readCachedDatasetFiles() {
                try {
                    const raw = sessionStorage.getItem(DATASET_FILE_CACHE_KEY);
                    if (!raw) return null;
                    const cached = JSON.parse(raw);
                    if (!cached || !Array.isArray(cached.ids) || cached.ids.length !== 2) return null;
                    if (Date.now() - Number(cached.ts || 0) > DATASET_FILE_CACHE_TTL_MS) return null;
                    return cached.ids;
                } catch (_) {
                    return null;
                }
            }

            writeCachedDatasetFiles(ids) {
                try {
                    sessionStorage.setItem(DATASET_FILE_CACHE_KEY, JSON.stringify({
                        ids,
                        ts: Date.now()
                    }));
                } catch (_) {}
            }

            async findLatestDatasetFiles() {
                const cached = this.readCachedDatasetFiles();
                if (cached) {
                    this.dataFileIds = cached;
                    return;
                }
                const wanted = [DATASET_FILE_NAMES.data, DATASET_FILE_NAMES.guide];
                // Listing is newest-first, so stop paging as soon as both names have
                // appeared rather than walking the entire account file list.
                const files = await this.listOpenAIFiles(
                    collected => wanted.every(name => this.pickLatestFile(collected, name))
                );
                const dataFile = this.pickLatestFile(files, DATASET_FILE_NAMES.data);
                const guideFile = this.pickLatestFile(files, DATASET_FILE_NAMES.guide);
                if (!dataFile || !guideFile) {
                    const missing = [
                        !dataFile ? DATASET_FILE_NAMES.data : null,
                        !guideFile ? DATASET_FILE_NAMES.guide : null
                    ].filter(Boolean).join(' and ');
                    throw new Error(`Dataset files not found (${missing})`);
                }
                this.dataFileIds = [dataFile.id, guideFile.id];
                this.writeCachedDatasetFiles(this.dataFileIds);
            }

            async initialize() {
                this.initPromise = this.runInitialize();
                try {
                    await this.initPromise;
                } finally {
                    this.initPromise = null;
                }
            }

            async runInitialize() {
                try {
                    this.showDataInsights();
                    this.updateStatus('Loading AI assistant...', 'loading');

                    await this.bootstrapPromise;

                    this.updateStatus('Setting up conversation...', 'loading');
                    await Promise.all([
                        this.loadInstructions(),
                        this.findLatestDatasetFiles(),
                        this.createConversation()
                    ]);

                    this.updateStatus('Ready!', 'ready');
                    this.isInitialized = true;
                    this.setLoading(false);
                    this.messageInput.disabled = false;
                    this.sendButton.disabled = false;
                } catch (error) {
                    this.showError(`🚨 Setup failed: ${error.message}`);
                    this.updateStatus('❌ Setup failed', 'error');
                    this.setLoading(false);
                }
            }

            async ensureReady() {
                if (this.isInitialized) return true;
                if (this.initPromise) {
                    await this.initPromise;
                } else {
                    await this.initialize();
                }
                return this.isInitialized;
            }

            async createConversation() {
                const response = await fetch('https://api.openai.com/v1/conversations', {
                    method: 'POST',
                    headers: this.openaiHeaders(true),
                    body: JSON.stringify({
                        metadata: { user_id: this.currentMemberId || 'anonymous' }
                    }),
                    signal: (this.fetchController && this.fetchController.signal) || undefined
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`Conversation creation failed: ${errorData.error?.message || response.statusText}`);
                }

                const data = await response.json();
                this.conversationId = data.id;
                this.containerId = null;
                this.currentResponseId = null;
            }

            async cancelResponse(responseId) {
                const id = responseId || this.currentResponseId;
                try {
                    if (id) {
                        await fetch(`https://api.openai.com/v1/responses/${id}/cancel`, {
                            method: 'POST',
                            headers: this.openaiHeaders(true)
                        });
                    }
                } catch (_) {}
            }

            async newChat() {
                try {
                    this.updateStatus('Starting new chat...', 'loading');
                    const responseId = this.currentResponseId;
                    this.cancelRequested = true;
                    if (!this.fetchController) this.fetchController = new AbortController();
                    try { this.fetchController.abort(); } catch(_) {}
                    await this.cancelResponse(responseId);
                    this.fetchController = null;
                    await this.createConversation();
                    this.messagesContainer.innerHTML = '';
                    this.releaseChartObjectUrls();
                    this.shownChartKeys.clear();
                    this.currentResponseId = null;
                    this.cancelRequested = false;
                    this.fetchController = null;
                    this.liveAssistant = null;
                    this.pendingPlayerCall = null;
                    this.clearReply();
                    this.setLoading(false);
                    this.messageInput.value = '';
                    this.showDataInsights();
                    this.updateStatus('Ready!', 'ready');
                } catch (e) {
                    this.showError('Failed to start a new chat.');
                    this.updateStatus('Error', 'error');
                }
            }


            decorateUserMessage(message) {
                let decorated = message;

                if (this.replyTo && this.replyTo.text) {
                    const excerpt = String(this.replyTo.text).replace(/\s+/g, ' ').trim().slice(0, 600);
                    decorated += `\n\n[REPLYING TO ${this.replyTo.role === 'assistant' ? 'ASSISTANT' : 'USER'} MESSAGE]:\n"""${excerpt}"""\nTreat that excerpt as the specific message being followed up. Answer the new request in that context.`;
                }

                decorated += this.chartsEnabled
                    ? '\n\n[CHARTS ENABLED: Create visualizations when they add value to the analysis. Generate ONLY charts for THIS question. Save each figure with a unique timestamped filename and close it. Never re-plot or re-save a chart from an earlier turn.]'
                    : '\n\n[CHARTS DISABLED: Provide text-only responses]';

                const alias = this.resolveLeagueAliases(message);
                if (alias) {
                    decorated += `\n[LEAGUE GROUP: ${alias.name} ⇒ ${alias.list.join(', ')}]`;
                    decorated += `\n[APPLY FILTER: Only include rows where League ∈ {${alias.list.join(', ')}}]`;
                }

                const defLike = /\b(what\s+is|explain|definition|how\s+(is|was)\s+.*(computed|calculated)|methodology)\b/i.test(message);
                if (defLike) {
                    let guideTerm = '';
                    const termCandidates = [
                        /performance\s*index/i,
                        /possession\s*\+\-?/i
                    ];
                    for (const rx of termCandidates) {
                        const m = message.match(rx);
                        if (m && m[0]) { guideTerm = m[0]; break; }
                    }
                    decorated += '\n\n[DEFINITIONS MODE: Use guide.html ONLY for definitions/methodology. Do NOT rely on general knowledge. Quote and cite the relevant section. Parse the local HTML file. Do NOT use network requests. If not found, state: "Not specified in the DataMB Guide."]';
                    if (guideTerm) {
                        decorated += `\n[GUIDE SEARCH TERM: ${guideTerm}]`;
                        if (/performance\s*index/i.test(guideTerm)) {
                            decorated += '\n[GUIDE ANCHOR HINT: id="performanceindex" and <h4>Performance Index</h4>]';
                        }
                    }
                    decorated += '\n[ATTACHED FILES: data.csv, guide.html. Access with open(\'guide.html\', encoding=\'utf-8\').]';
                    decorated += '\n[CODE SCAFFOLD:\nfrom bs4 import BeautifulSoup\nhtml=open(\'guide.html\', encoding=\'utf-8\').read()\nsoup=BeautifulSoup(html, \'html.parser\')\nsec=soup.select_one(\'#performanceindex\') or soup.find(id=\'performanceindex\')\nprint(sec.get_text("\\n", strip=True) if sec else "NOT_FOUND")\n]';
                }

                return decorated;
            }

            analystTools() {
                return [
                    {
                        type: 'code_interpreter',
                        container: {
                            type: 'auto',
                            memory_limit: '4g',
                            file_ids: this.dataFileIds
                        }
                    },
                    {
                        type: 'function',
                        name: PLAYER_CHOICE_TOOL,
                        description: 'Call this when two or more distinct people match a player name and you cannot safely pick one. Present every remaining candidate. Do not continue the analysis in the same turn. The user will tap a player, then you continue using only that row.',
                        parameters: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: 'The name the user typed'
                                },
                                guess_index: {
                                    type: 'integer',
                                    description: '0-based index of your best guess'
                                },
                                players: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            stored_name: { type: 'string' },
                                            team: { type: 'string' },
                                            league: { type: 'string' },
                                            position: { type: 'string' },
                                            age: { type: 'integer' },
                                            minutes: { type: 'integer' }
                                        },
                                        required: ['stored_name', 'team', 'league', 'position']
                                    }
                                }
                            },
                            required: ['players']
                        }
                    }
                ];
            }

            buildResponsePayload(input) {
                const payload = {
                    model: this.model,
                    instructions: this.instructions,
                    input,
                    conversation: this.conversationId,
                    tools: this.analystTools(),
                    include: ['code_interpreter_call.outputs'],
                    truncation: 'auto',
                    store: true,
                    stream: true
                };

                if (isReasoningModel(this.model)) {
                    payload.reasoning = {
                        effort: this.chartsEnabled ? 'medium' : 'low',
                        summary: 'auto'
                    };
                } else {
                    payload.temperature = ANALYST_TEMPERATURE;
                    payload.top_p = ANALYST_TOP_P;
                }

                return payload;
            }

            isUnknownModelError(message) {
                return /model/i.test(message || '') && /(does not exist|not found|invalid|unknown|access|not available)/i.test(message || '');
            }

            async advanceModelFallback() {
                const idx = this.modelCandidates.indexOf(this.model);
                if (idx >= 0 && idx < this.modelCandidates.length - 1) {
                    this.model = this.modelCandidates[idx + 1];
                    try { sessionStorage.setItem('datamb_analyst_model', this.model); } catch (_) {}
                    return true;
                }
                return false;
            }

            async sendMessage() {
                const message = this.messageInput.value.trim();
                if (!message || this.isSending) return;

                if (!(await this.ensureReady())) return;

                if (this.currentMemberId && !this.quotaCache[this.currentMemberId]) {
                    await this.preloadRemoteQuotaForId(this.currentMemberId);
                }

                this.messageInput.value = '';
                this.messageInput.style.height = 'auto';
                this.addMessage(message, 'user');
                const decorated = this.decorateUserMessage(message);
                this.clearReply();

                if (!this.canSendNow()) {
                    return;
                }
                this.bumpQuotaAsync();

                await this.runModelTurn([{ role: 'user', content: decorated }]);
            }

            async runModelTurn(input) {
                this.isSending = true;
                this.setLoading(true);
                this.setStopUI(true);
                this.pendingPlayerCall = null;

                try {
                    this.cancelRequested = false;
                    this.fetchController = new AbortController();

                    if (!this.dataFileIds.length) {
                        await this.findLatestDatasetFiles();
                    }

                    let payload = this.buildResponsePayload(input);
                    let response = await fetch('https://api.openai.com/v1/responses', {
                        method: 'POST',
                        headers: this.openaiHeaders(true),
                        body: JSON.stringify(payload),
                        signal: this.fetchController.signal
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        const errMsg = errorData.error?.message || response.statusText;
                        if (this.isUnknownModelError(errMsg) && await this.advanceModelFallback()) {
                            payload = this.buildResponsePayload(input);
                            response = await fetch('https://api.openai.com/v1/responses', {
                                method: 'POST',
                                headers: this.openaiHeaders(true),
                                body: JSON.stringify(payload),
                                signal: this.fetchController.signal
                            });
                        } else if (payload.reasoning && /summary|reasoning|unsupported|unknown parameter|invalid/i.test(errMsg)) {
                            delete payload.reasoning.summary;
                            response = await fetch('https://api.openai.com/v1/responses', {
                                method: 'POST',
                                headers: this.openaiHeaders(true),
                                body: JSON.stringify(payload),
                                signal: this.fetchController.signal
                            });
                        } else {
                            throw new Error(`Response failed: ${errMsg}`);
                        }
                    }

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(`Response failed: ${errorData.error?.message || response.statusText}`);
                    }

                    const streamed = await this.consumeResponseStream(response);
                    if (streamed.terminal && streamed.terminal !== 'completed' && !this.pendingPlayerCall) {
                        if (streamed.response) {
                            await this.finishFromResponse(streamed.response);
                        }
                    } else if (streamed.needsPoll && this.currentResponseId) {
                        await this.pollResponseStatus(this.currentResponseId);
                    } else if (streamed.response) {
                        await this.finishFromResponse(streamed.response);
                    }

                } catch (error) {
                    if (this.currentResponseId && !this.cancelRequested && !this.isAbortError(error)) {
                        try {
                            await this.pollResponseStatus(this.currentResponseId);
                        } catch (pollError) {
                            if (!this.isAbortError(pollError)) {
                                this.showError(`Analysis failed: ${pollError.message || error.message}`);
                            }
                        }
                    } else if (!this.isAbortError(error)) {
                        this.showError(`Analysis failed: ${error.message}`);
                    }
                } finally {
                    this.setLoading(false);
                    this.setStopUI(false);
                    this.isSending = false;
                    if (!this.pendingPlayerCall) this.currentResponseId = null;
                    this.liveAssistant = null;
                }
            }


            async consumeResponseStream(response) {
                const result = {
                    response: null,
                    terminal: null,
                    needsPoll: false
                };

                if (!response.body || !response.body.getReader) {
                    const data = await response.json();
                    this.currentResponseId = data.id;
                    result.response = data;
                    result.terminal = data.status;
                    result.needsPoll = data.status !== 'completed' && data.status !== 'failed';
                    return result;
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                let assistantText = '';
                const functionArgs = {};
                const functionMeta = {};
                const annotations = [];
                let sawTerminal = false;

                const handleEvent = (evt) => {
                    if (!evt || !evt.type) return;
                    const type = evt.type;

                    if (evt.response && evt.response.id) {
                        this.currentResponseId = evt.response.id;
                    }

                    switch (type) {
                        case 'response.created':
                        case 'response.queued':
                            this.setActivity('queued', this.t('activity.queued', 'Queued…'));
                            break;
                        case 'response.in_progress':
                            this.setActivity('thinking', this.t('activity.thinking', 'Thinking…'));
                            break;
                        case 'response.output_item.added': {
                            const item = evt.item || {};
                            if (item.type === 'code_interpreter_call') {
                                if (item.container_id) this.containerId = item.container_id;
                                this.setActivity('code', this.t('activity.runningCode', 'Running calculations…'));
                            } else if (item.type === 'reasoning') {
                                this.setActivity('thinking', this.t('activity.thinking', 'Thinking…'));
                            } else if (item.type === 'function_call') {
                                functionMeta[item.id || item.call_id] = item;
                                if (item.call_id) functionArgs[item.call_id] = '';
                            } else if (item.type === 'message') {
                                this.setActivity('writing', this.t('activity.writing', 'Writing the answer…'));
                            }
                            break;
                        }
                        case 'response.reasoning_summary_text.delta':
                            if (evt.delta) this.appendReasoning(evt.delta);
                            break;
                        case 'response.reasoning_summary_text.done':
                            if (evt.text) this.setReasoning(evt.text);
                            break;
                        case 'response.code_interpreter_call.in_progress':
                            this.setActivity('code', this.t('activity.runningCode', 'Running calculations…'));
                            break;
                        case 'response.code_interpreter_call.interpreting':
                            this.setActivity('code', this.t('activity.interpreting', 'Interpreting results…'));
                            break;
                        case 'response.code_interpreter_call_code.delta':
                            if (evt.delta) this.setActivity('code', this.humanizeCode(evt.delta), evt.delta);
                            break;
                        case 'response.code_interpreter_call_code.done':
                            if (evt.code) this.setActivity('code', this.humanizeCode(evt.code), evt.code);
                            break;
                        case 'response.code_interpreter_call.completed':
                            this.setActivity('code', this.t('activity.interpreting', 'Interpreting results…'));
                            break;
                        case 'response.output_text.delta':
                            assistantText += evt.delta || '';
                            this.appendLiveText(assistantText);
                            break;
                        case 'response.output_text.done':
                            if (typeof evt.text === 'string') {
                                assistantText = evt.text;
                                this.appendLiveText(assistantText);
                            }
                            break;
                        case 'response.output_text.annotation.added':
                            if (evt.annotation) annotations.push(evt.annotation);
                            break;
                        case 'response.function_call_arguments.delta': {
                            const key = evt.item_id || evt.call_id;
                            if (key) functionArgs[key] = (functionArgs[key] || '') + (evt.delta || '');
                            break;
                        }
                        case 'response.function_call_arguments.done': {
                            const key = evt.item_id || evt.call_id;
                            if (key && evt.arguments) functionArgs[key] = evt.arguments;
                            if (evt.name === PLAYER_CHOICE_TOOL || this.isPlayerChoiceName(evt.name)) {
                                this.capturePlayerChoice(evt.call_id || (functionMeta[key] && functionMeta[key].call_id), evt.arguments || functionArgs[key]);
                            }
                            break;
                        }
                        case 'response.output_item.done': {
                            const item = evt.item || {};
                            if (item.type === 'function_call' && (item.name === PLAYER_CHOICE_TOOL || this.isPlayerChoiceName(item.name))) {
                                this.capturePlayerChoice(item.call_id, item.arguments || functionArgs[item.id] || functionArgs[item.call_id]);
                            }
                            if (item.type === 'code_interpreter_call' && item.container_id) {
                                this.containerId = item.container_id;
                            }
                            break;
                        }
                        case 'response.completed':
                            sawTerminal = true;
                            result.terminal = 'completed';
                            result.response = evt.response || result.response;
                            break;
                        case 'response.failed':
                            sawTerminal = true;
                            result.terminal = 'failed';
                            result.response = evt.response || result.response;
                            throw new Error(evt.response?.error?.message || 'Analysis failed');
                        case 'response.incomplete':
                            sawTerminal = true;
                            result.terminal = 'incomplete';
                            result.response = evt.response || result.response;
                            break;
                        case 'error':
                            throw new Error(evt.message || 'Stream error');
                        default:
                            break;
                    }

                    if (evt.response && evt.response.output) {
                        result.response = evt.response;
                    }
                };

                while (true) {
                    if (this.cancelRequested) throw new Error('Cancelled');
                    const { value, done } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const chunks = buffer.split('\n\n');
                    buffer = chunks.pop() || '';
                    for (const chunk of chunks) {
                        const evt = this.parseSseChunk(chunk);
                        if (evt) handleEvent(evt);
                    }
                }

                if (buffer.trim()) {
                    const evt = this.parseSseChunk(buffer);
                    if (evt) handleEvent(evt);
                }

                if (result.response) {
                    this.stashStreamAnnotations(result.response, annotations);
                }

                if (!sawTerminal && this.currentResponseId) {
                    result.needsPoll = true;
                }

                return result;
            }

            parseSseChunk(chunk) {
                const lines = String(chunk || '').split('\n');
                let data = '';
                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        data += line.slice(5).trim();
                    }
                }
                if (!data || data === '[DONE]') return null;
                try {
                    return JSON.parse(data);
                } catch (_) {
                    return null;
                }
            }

            isPlayerChoiceName(name) {
                return name === PLAYER_CHOICE_TOOL;
            }

            stashStreamAnnotations(response, annotations) {
                if (!response || !annotations.length) return;
                response.__streamAnnotations = annotations;
            }

            capturePlayerChoice(callId, rawArgs) {
                if (!callId || this.pendingPlayerCall) return;
                let parsed = rawArgs;
                if (typeof rawArgs === 'string') {
                    try { parsed = JSON.parse(rawArgs); } catch (_) { return; }
                }
                if (!parsed || !Array.isArray(parsed.players) || !parsed.players.length) return;
                this.pendingPlayerCall = {
                    callId,
                    query: parsed.query || '',
                    guessIndex: Number.isInteger(parsed.guess_index) ? parsed.guess_index : 0,
                    players: parsed.players
                };
            }

            humanizeCode(code) {
                const c = String(code || '').toLowerCase();
                if (/read_csv|guide\.html/.test(c)) return this.t('activity.loadingDataset', 'Loading the dataset…');
                if (/\bfold\s*\(|player/.test(c) && /(str\.|contains|==|isin)/.test(c)) {
                    return this.t('activity.matchingPlayers', 'Matching player names…');
                }
                if (/matplotlib|plt\.|seaborn|radar|savefig/.test(c)) {
                    return this.t('activity.chart', 'Creating a chart…');
                }
                if (/beautiful|soup|select_one|#performanceindex/.test(c)) {
                    return this.t('activity.guide', 'Looking up the DataMB Guide…');
                }
                if (/percentile|rank\s*\(/.test(c)) return this.t('activity.percentiles', 'Computing percentiles…');
                if (/groupby|nlargest|sort_values|head\s*\(/.test(c)) return this.t('activity.ranking', 'Ranking players…');
                return this.t('activity.runningCode', 'Running calculations…');
            }

            ensureLiveAssistant() {
                if (this.liveAssistant && this.liveAssistant.messageEl && this.liveAssistant.messageEl.isConnected) {
                    return this.liveAssistant;
                }
                const messageEl = this.createMessageContainer('assistant');
                messageEl.classList.add('live-assistant');
                const contentDiv = messageEl.querySelector('.message-content');
                contentDiv.innerHTML = `
                    <div class="activity-panel">
                        <div class="activity-row">
                            <div class="typing" aria-hidden="true">
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                            </div>
                            <div class="activity-status">${this.escapeHTML(this.t('activity.analyzing', 'Analyzing data…'))}</div>
                        </div>
                        <div class="activity-reasoning" hidden></div>
                        <pre class="activity-code" hidden></pre>
                    </div>
                    <div class="markdown-body stream-body"></div>
                    <div class="live-charts"></div>
                `;
                this.liveAssistant = {
                    messageEl,
                    contentDiv,
                    statusEl: contentDiv.querySelector('.activity-status'),
                    reasoningEl: contentDiv.querySelector('.activity-reasoning'),
                    codeEl: contentDiv.querySelector('.activity-code'),
                    bodyEl: contentDiv.querySelector('.stream-body'),
                    chartsEl: contentDiv.querySelector('.live-charts'),
                    text: '',
                    reasoning: ''
                };
                return this.liveAssistant;
            }

            setActivity(kind, label, codeSnippet) {
                const live = this.ensureLiveAssistant();
                this.updateStatus(
                    kind === 'code' ? 'Running calculations...' : (kind === 'writing' ? 'Analyzing data...' : 'Analyzing data...'),
                    'loading'
                );
                if (live.statusEl) live.statusEl.textContent = label;
                if (codeSnippet && live.codeEl) {
                    const snippet = String(codeSnippet).trim().split('\n').slice(-4).join('\n');
                    live.codeEl.hidden = false;
                    live.codeEl.textContent = snippet;
                }
                this.scrollToBottom();
            }

            appendReasoning(delta) {
                const live = this.ensureLiveAssistant();
                live.reasoning = (live.reasoning || '') + delta;
                this.renderReasoning(live);
            }

            setReasoning(text) {
                const live = this.ensureLiveAssistant();
                live.reasoning = text;
                this.renderReasoning(live);
            }

            renderReasoning(live) {
                if (!live.reasoningEl) return;
                const text = String(live.reasoning || '').trim();
                if (!text) {
                    live.reasoningEl.hidden = true;
                    return;
                }
                live.reasoningEl.hidden = false;
                live.reasoningEl.textContent = text;
                this.scrollToBottom();
            }

            appendLiveText(fullText) {
                const live = this.ensureLiveAssistant();
                live.text = fullText;
                const panel = live.contentDiv.querySelector('.activity-panel');
                if (panel) panel.classList.add('compact');
                if (this._streamRenderTimer) return;
                this._streamRenderTimer = setTimeout(() => {
                    this._streamRenderTimer = null;
                    if (!this.liveAssistant || !this.liveAssistant.bodyEl) return;
                    this.liveAssistant.bodyEl.innerHTML = this.formatContent(this.liveAssistant.text);
                    this.scrollToBottom();
                }, 80);
            }

            async finishFromResponse(data) {
                if (!data) return;
                if (this._streamRenderTimer) {
                    clearTimeout(this._streamRenderTimer);
                    this._streamRenderTimer = null;
                }

                if (!this.pendingPlayerCall) {
                    for (const item of data.output || []) {
                        if (item.type === 'function_call' && item.name === PLAYER_CHOICE_TOOL) {
                            this.capturePlayerChoice(item.call_id, item.arguments);
                        }
                    }
                }

                const live = this.liveAssistant && this.liveAssistant.messageEl && this.liveAssistant.messageEl.isConnected
                    ? this.liveAssistant
                    : null;

                let fullContent = (live && live.text) || '';
                const pendingImages = this.collectTurnImages(data);

                if (!fullContent) {
                    for (const item of data.output || []) {
                        if (item.type === 'message' && (item.role === 'assistant' || !item.role)) {
                            for (const part of item.content || []) {
                                if (part.type === 'output_text') fullContent += part.text || '';
                            }
                        }
                    }
                    if (!fullContent && data.output_text) fullContent = data.output_text;
                }

                if (this.pendingPlayerCall && !fullContent) {
                    fullContent = '';
                }

                let host = live;
                if (!host) {
                    const messageEl = this.createMessageContainer('assistant');
                    const contentDiv = messageEl.querySelector('.message-content');
                    contentDiv.innerHTML = `<div class="markdown-body stream-body"></div><div class="live-charts"></div>`;
                    host = {
                        messageEl,
                        contentDiv,
                        bodyEl: contentDiv.querySelector('.stream-body'),
                        chartsEl: contentDiv.querySelector('.live-charts')
                    };
                }

                if (host.contentDiv) {
                    const panel = host.contentDiv.querySelector('.activity-panel');
                    if (panel) panel.remove();
                    host.messageEl.classList.remove('live-assistant');
                    host.messageEl.classList.remove('typing-message');
                }

                if (fullContent && host.bodyEl) {
                    host.bodyEl.innerHTML = this.formatContent(fullContent);
                    host.messageEl.dataset.rawText = fullContent;
                } else if (host.bodyEl && !this.pendingPlayerCall) {
                    host.bodyEl.innerHTML = '';
                }

                if (this.pendingPlayerCall) {
                    this.renderPlayerPicker(host.contentDiv, this.pendingPlayerCall);
                }

                for (const img of pendingImages) {
                    await this.displayGeneratedFile(img.fileId, img.containerId, host.chartsEl);
                }

                if (this.chartsEnabled && pendingImages.length === 0) {
                    const containerId = this.containerId;
                    const createdAt = Number(data.created_at || 0);
                    if (containerId && createdAt) {
                        const extras = await this.listRecentContainerImages(containerId, createdAt);
                        for (const img of extras) {
                            await this.displayGeneratedFile(img.fileId, img.containerId, host.chartsEl);
                        }
                    }
                }

                if (fullContent || pendingImages.length || this.pendingPlayerCall) {
                    this.updateStatus('Analysis complete!', 'ready');
                }
                this.scrollToBottom();
            }

            collectTurnImages(data) {
                const pending = [];
                const seen = new Set();
                const pushImg = (fileId, containerId) => {
                    if (!fileId) return;
                    const key = `${containerId || ''}:${fileId}`;
                    if (seen.has(key) || this.shownChartKeys.has(key)) return;
                    seen.add(key);
                    pending.push({ fileId, containerId });
                };

                const considerAnn = (ann) => {
                    if (!ann) return;
                    if (ann.type === 'container_file_citation' && this.isChartFileName(ann.filename || ann.file_id)) {
                        pushImg(ann.file_id, ann.container_id || this.containerId);
                    }
                };

                for (const ann of data.__streamAnnotations || []) considerAnn(ann);

                for (const item of data.output || []) {
                    if (item.type === 'code_interpreter_call' && item.container_id) {
                        this.containerId = item.container_id;
                    }
                    if (item.type === 'message' && (item.role === 'assistant' || !item.role)) {
                        for (const part of item.content || []) {
                            if (part.type === 'output_text') {
                                for (const ann of part.annotations || []) considerAnn(ann);
                            } else if (part.type === 'image_file' && part.image_file?.file_id) {
                                pushImg(part.image_file.file_id, this.containerId);
                            }
                        }
                    }
                }

                return pending;
            }

            async pollResponseStatus(responseId) {
                let pollInterval = 700;
                const maxInterval = 3000;

                while (true) {
                    if (this.cancelRequested) {
                        throw new Error('Cancelled');
                    }
                    try {
                        const params = new URLSearchParams({ include: 'code_interpreter_call.outputs' });
                        const response = await fetch(`https://api.openai.com/v1/responses/${responseId}?${params.toString()}`, {
                            headers: this.openaiHeaders(false),
                            signal: (this.fetchController && this.fetchController.signal) || undefined
                        });

                        if (!response.ok) {
                            if (this.cancelRequested) throw new Error('Cancelled');
                            throw new Error(`Status check failed: ${response.statusText}`);
                        }

                        const result = await response.json();

                        if (result.status === 'in_progress' || result.status === 'queued') {
                            const usingCode = Array.isArray(result.output) && result.output.some(item => item.type === 'code_interpreter_call');
                            this.setActivity(
                                usingCode ? 'code' : 'thinking',
                                usingCode
                                    ? this.t('activity.runningCode', 'Running calculations…')
                                    : this.t('activity.analyzing', 'Analyzing data…')
                            );
                        }

                        if (result.status === 'completed') {
                            await this.finishFromResponse(result);
                            break;
                        } else if (result.status === 'failed' || result.status === 'cancelled' || result.status === 'incomplete') {
                            if (this.cancelRequested) throw new Error('Cancelled');
                            const detail = result.error?.message || result.incomplete_details?.reason || 'Unknown error';
                            throw new Error(`Analysis ${result.status}: ${detail}`);
                        }

                        await new Promise(resolve => setTimeout(resolve, pollInterval));
                        pollInterval = Math.min(maxInterval, pollInterval * 1.35);
                    } catch (error) {
                        if (this.cancelRequested) { throw new Error('Cancelled'); }
                        throw error;
                    }
                }
            }

            isChartFileName(name) {
                return /\.(png|jpe?g|gif|webp|svg)$/i.test(String(name || ''));
            }

            asUnixSeconds(value) {
                const n = Number(value || 0);
                if (!n) return 0;
                return n > 1e12 ? Math.floor(n / 1000) : n;
            }

            async listRecentContainerImages(containerId, responseCreatedAt) {
                try {
                    const response = await fetch(`https://api.openai.com/v1/containers/${containerId}/files`, {
                        headers: this.openaiHeaders(false),
                        signal: (this.fetchController && this.fetchController.signal) || undefined
                    });
                    if (!response.ok) return [];
                    const data = await response.json();
                    const files = data.data || data.files || [];
                    const floor = this.asUnixSeconds(responseCreatedAt) - 2;
                    return files
                        .filter(f => {
                            if (!f || !f.id || f.source !== 'assistant') return false;
                            if (!this.isChartFileName(f.path || f.filename || f.id)) return false;
                            const created = this.asUnixSeconds(f.created_at);
                            if (!floor || !created) return false;
                            return created >= floor;
                        })
                        .map(f => ({
                            fileId: f.id,
                            containerId: f.container_id || containerId
                        }));
                } catch (_) {
                    return [];
                }
            }

            async displayGeneratedFile(fileId, containerId, hostEl) {
                try {
                    const key = `${containerId || ''}:${fileId}`;
                    if (this.shownChartKeys.has(key)) return;
                    this.shownChartKeys.add(key);

                    let res = null;
                    if (containerId) {
                        res = await fetch(`https://api.openai.com/v1/containers/${containerId}/files/${fileId}/content`, {
                            headers: { 'Authorization': `Bearer ${this.acToAdj}` },
                            signal: (this.fetchController && this.fetchController.signal) || undefined
                        });
                    }
                    if (!res || !res.ok) {
                        res = await fetch(`https://api.openai.com/v1/files/${fileId}/content`, {
                            headers: { 'Authorization': `Bearer ${this.acToAdj}` },
                            signal: (this.fetchController && this.fetchController.signal) || undefined
                        });
                    }
                    if (!res.ok) {
                        throw new Error(`Image fetch failed (${res.status})`);
                    }
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    this.chartObjectUrls.push(url);

                    const imageDiv = document.createElement('div');
                    imageDiv.className = 'chart-container';

                    const img = document.createElement('img');
                    img.alt = 'Generated Chart';
                    img.addEventListener('load', () => this.scrollToBottom(), { once: true });
                    img.src = url;

                    const downloadLink = document.createElement('a');
                    downloadLink.className = 'chart-download';
                    downloadLink.href = url;
                    downloadLink.download = `datamb-chart-${Date.now()}.png`;
                    downloadLink.setAttribute('aria-label', this.t('tooltips.downloadChart', 'Download chart'));
                    downloadLink.title = this.t('tooltips.downloadChart', 'Download chart');
                    downloadLink.innerHTML = '<i class="fas fa-download"></i>';

                    imageDiv.appendChild(img);
                    imageDiv.appendChild(downloadLink);

                    const target = hostEl || (this.liveAssistant && this.liveAssistant.chartsEl) || this.messagesContainer;
                    target.appendChild(imageDiv);
                    this.scrollToBottom();
                } catch (err) {
                }
            }

            // Chart images are blob URLs, which the browser keeps alive until they
            // are explicitly revoked. Called whenever the transcript is discarded.
            releaseChartObjectUrls() {
                for (const url of this.chartObjectUrls) {
                    try { URL.revokeObjectURL(url); } catch (_) {}
                }
                this.chartObjectUrls = [];
            }

            createMessageContainer(role) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${role}`;
                messageDiv.dataset.role = role;
                messageDiv.dataset.msgId = String(++this.messageSeq);

                const avatar = document.createElement('div');
                avatar.className = 'avatar';
                if (role === 'user') {
                    avatar.textContent = 'You';
                } else {
                    avatar.innerHTML = '<img src="./chat.png" alt="AI" />';
                }

                const messageContent = document.createElement('div');
                messageContent.className = 'message-content';

                const actions = document.createElement('button');
                actions.type = 'button';
                actions.className = 'message-reply-btn';
                actions.dataset.replyTo = messageDiv.dataset.msgId;
                actions.title = this.t('tooltips.reply', 'Reply');
                actions.setAttribute('aria-label', this.t('tooltips.reply', 'Reply'));
                actions.innerHTML = '<i class="fas fa-reply"></i>';

                messageDiv.appendChild(avatar);
                messageDiv.appendChild(messageContent);
                messageDiv.appendChild(actions);
                this.messagesContainer.appendChild(messageDiv);

                this.scrollToBottom();
                return messageDiv;
            }

            addMessage(content, role) {
                const messageDiv = this.createMessageContainer(role);
                const contentDiv = messageDiv.querySelector('.message-content');
                messageDiv.dataset.rawText = content;
                contentDiv.innerHTML = this.formatContent(content);
                return messageDiv;
            }

            formatContent(content) {
                // Parse Markdown and sanitize
                try {
                const parsed = window.marked ? marked.parse(content || '') : (content || '').replace(/\n/g, '<br>');
                const clean = window.DOMPurify ? DOMPurify.sanitize(parsed) : parsed;
                    // Enhance tables
                    const container = document.createElement('div');
                const isSingleLine = (content || '').trim().indexOf('\n') === -1 && (content || '').trim().length <= 60;
                container.className = 'markdown-body' + (isSingleLine ? ' compact' : '');
                container.innerHTML = clean;
                    const tables = container.querySelectorAll('table');
                    tables.forEach((table) => {
                        table.classList.add('data-table');
                        const totalRows = table.querySelectorAll('tbody tr').length;
                        const wrapper = document.createElement('div');
                        wrapper.className = 'table-container';
                        if (totalRows > 10) {
                            wrapper.classList.add('collapsed');
                            const controls = document.createElement('div');
                            controls.className = 'table-controls';
                            controls.innerHTML = `
                                <div class=\"table-info\">Showing ${Math.min(10, totalRows)} of ${totalRows} results</div>
                                <button class=\"expand-button\" onclick=\"toggleTable(this)\">Show All</button>
                            `;
                            wrapper.appendChild(controls);
                        }
                        table.parentNode.insertBefore(wrapper, table);
                        wrapper.appendChild(table);
                        // Add a small spacer after each table to separate following text
                        const spacer = document.createElement('div');
                        spacer.style.height = '12px';
                        wrapper.after(spacer);
                    });
                    return container.outerHTML;
                } catch (e) {
                    return (content || '')
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/\n/g, '<br>');
                }
            }

            scrollToBottom() {
                if (this.scrollQueued) return;
                this.scrollQueued = true;
                requestAnimationFrame(() => {
                    this.scrollQueued = false;
                    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
                });
            }

            setLoading(isLoading) {
                if (isLoading) {
                    this.ensureLiveAssistant();
                    this.setActivity('thinking', this.t('activity.analyzing', 'Analyzing data…'));
                } else if (!this.pendingPlayerCall && this.liveAssistant && this.liveAssistant.messageEl) {
                    const hasBody = this.liveAssistant.bodyEl && this.liveAssistant.bodyEl.innerHTML.trim();
                    const hasCharts = this.liveAssistant.chartsEl && this.liveAssistant.chartsEl.childElementCount;
                    const hasPicker = this.liveAssistant.contentDiv && this.liveAssistant.contentDiv.querySelector('.player-selector');
                    if (!hasBody && !hasCharts && !hasPicker) {
                        this.liveAssistant.messageEl.remove();
                    }
                    if (!hasBody && !hasCharts && !hasPicker) this.liveAssistant = null;
                }
            }

            setStopUI(active) {
                try {
                    const iconSpan = this.sendButton.querySelector('span');
                    if (active) {
                        this.sendButton.classList.add('stop');
                        if (iconSpan) iconSpan.innerHTML = '<i class="fas fa-stop"></i>';
                        this.sendButton.setAttribute('data-i18n', 'tooltips.stop');
                        this.sendButton.setAttribute('data-i18n-attr', 'title');
                        window.translateElement && window.translateElement(this.sendButton, window.currentTranslations);
                    } else {
                        this.sendButton.classList.remove('stop');
                        if (iconSpan) iconSpan.innerHTML = '<i class="fas fa-chevron-up"></i>';
                        this.sendButton.setAttribute('data-i18n', 'tooltips.send');
                        this.sendButton.setAttribute('data-i18n-attr', 'title');
                        window.translateElement && window.translateElement(this.sendButton, window.currentTranslations);
                    }
                } catch (_) {}
            }

            async stopRequest() {
                const responseId = this.currentResponseId;
                try {
                    this.cancelRequested = true;
                    if (!this.fetchController) this.fetchController = new AbortController();
                    try { this.fetchController.abort(); } catch(_) {}
                    await this.cancelResponse(responseId);
                    this.updateStatus('Stopped', 'ready');
                } catch (_) {
                } finally {
                    this.pendingPlayerCall = null;
                    if (this.liveAssistant && this.liveAssistant.messageEl) {
                        const hasBody = this.liveAssistant.bodyEl && this.liveAssistant.bodyEl.innerHTML.trim();
                        if (!hasBody) this.liveAssistant.messageEl.remove();
                    }
                    this.liveAssistant = null;
                    this.setLoading(false);
                    this.setStopUI(false);
                    this.cancelRequested = false;
                    this.fetchController = null;
                    this.currentResponseId = null;
                    this.isSending = false;
                }
            }

            isAbortError(error) {
                if (!error) return false;
                const msg = String(error && (error.message || error.toString() || ''));
                return (
                    error.name === 'AbortError' ||
                    /aborted/i.test(msg) ||
                    /cancelled/i.test(msg) ||
                    /canceled/i.test(msg)
                );
            }

            // Helper function to get quota display text
            getQuotaDisplayText() {
                if (!this.currentMemberId) return '';
                
                const cached = this.getQuotaCache(this.currentMemberId);
                if (!cached) return '';
                
                // Check if this is a banned user (count: 999)
                const isBannedUser = cached.count === 999;
                
                if (isBannedUser) {
                    // For banned users, always show 0/0 with no reset date
                    return ` <span class="quota-display" data-used="0" data-total="0" data-remaining="0" data-reset="">0 <i class="fas fa-bolt"></i></span>`;
                }
                
                const used = cached.count || 0;
                const totalLimit = this.MONTHLY_LIMIT + (cached.extendedQuota || 0);
                const remaining = totalLimit - used;
                
                return ` <span class="quota-display" data-used="${used}" data-total="${totalLimit}" data-remaining="${remaining}" data-reset="${cached.resetAt || ''}">${remaining} <i class="fas fa-bolt"></i></span>`;
            }

            // Single delegated listener: toggle on the quota chip, dismiss elsewhere.
            setupQuotaTooltip() {
                document.addEventListener('click', (e) => {
                    const quotaDisplay = e.target.closest('.quota-display');
                    if (quotaDisplay) {
                        this.toggleQuotaTooltip(quotaDisplay);
                        return;
                    }
                    if (!e.target.closest('.quota-tooltip')) {
                        this.closeQuotaTooltip();
                    }
                });
            }

            // Show quota tooltip
            showQuotaTooltip(quotaDisplay) {
                // Don't show if already visible
                if (document.querySelector('.quota-tooltip')) return;
                
                const used = parseInt(quotaDisplay.dataset.used);
                const total = parseInt(quotaDisplay.dataset.total);
                const remaining = parseInt(quotaDisplay.dataset.remaining);
                const resetAt = quotaDisplay.dataset.reset;

                // Calculate reset date (like limit reached but no minutes/hours)
                let resetDate = '';
                if (resetAt) {
                    const resetTime = parseInt(resetAt);
                    if (resetTime) {
                        const resetDateObj = new Date(resetTime);
                        // Force European date format: DD.MM.YY
                        const day = resetDateObj.getDate().toString().padStart(2, '0');
                        const month = (resetDateObj.getMonth() + 1).toString().padStart(2, '0');
                        const year = resetDateObj.getFullYear().toString().slice(-2);
                        resetDate = `${day}.${month}.${year}`;
                    }
                }

                // Create tooltip with clean icons
                const tooltip = document.createElement('div');
                tooltip.className = 'quota-tooltip';
                tooltip.innerHTML = `
                    <div class="tooltip-content">
                        <div class="quota-row">
                            <span class="quota-label">${used}</span>
                            <span class="quota-separator">/</span>
                            <span class="quota-value">${total}</span>
                        </div>
                        ${resetDate ? `
                        <div class="quota-row">
                            <i class="fas fa-redo"></i>
                            <span class="quota-label">${resetDate}</span>
                        </div>
                        ` : ''}
                    </div>
                `;

                // Position tooltip UNDER the quota display but LEFT-aligned
                const rect = quotaDisplay.getBoundingClientRect();
                tooltip.style.position = 'fixed';
                tooltip.style.left = `${rect.left - 84}px`; // 100px to the left so it's centered under
                tooltip.style.top = `${rect.bottom + 15}px`; // 25px lower to align with title bar
                tooltip.style.zIndex = '1000';

                document.body.appendChild(tooltip);
            }

            // Toggle quota tooltip (for clicks)
            toggleQuotaTooltip(quotaDisplay) {
                if (document.querySelector('.quota-tooltip')) {
                    this.closeQuotaTooltip();
                    return;
                }

                this.showQuotaTooltip(quotaDisplay);
            }

            // Close quota tooltip
            closeQuotaTooltip() {
                const tooltip = document.querySelector('.quota-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            }

            updateStatus(message, type) {
                const statusElement = this.status;

                // Get translated base message first
                let displayMessage = message;
                let i18nKey = null;
                
                try {
                    if (window.currentTranslations) {
                        const statusMap = {
                            'Stopped': 'status.stopped',
                            'Analysis complete!': 'status.analysisComplete',
                            'Analyzing data...': 'status.analyzingData',
                            'Running calculations...': 'status.runningCalculations',
                            'Error': 'status.error',
                            'Ready!': 'status.ready',
                            'Starting new chat...': 'status.startingNewChat',
                            'Setting up conversation...': 'status.settingUpConversation',
                            'Loading AI assistant...': 'status.loadingAIAssistant',
                            'Reading dataset...': 'status.readingDataset',
                            'No access': 'status.noAccess',
                            'Login required': 'status.loginRequired',
                            'Thinking…': 'activity.thinking',
                            'Running calculations...': 'status.runningCalculations',
                            'Analyzing data...': 'status.analyzingData'
                        };
                        i18nKey = statusMap[message];
                        
                        // Translate the base message first
                        if (i18nKey) {
                            const keys = i18nKey.split('.');
                            let value = window.currentTranslations;
                            for (const key of keys) {
                                if (value === undefined || value === null) break;
                                value = value[key];
                            }
                            if (value) {
                                displayMessage = value;
                            }
                        }
                    }
                } catch (_) {}
                
                            // Add quota info to ready status and analysis complete
            if (type === 'ready' && (message === 'Ready!' || message === 'Analysis complete!')) {
                const quotaText = this.getQuotaDisplayText();
                if (quotaText) {
                    displayMessage += ' <span class="status-separator">|</span>' + quotaText;
                }
            }
                
                // Reuse the existing nodes and skip no-op writes; this runs on every
                // poll tick, and rewriting innerHTML here churned the DOM and woke
                // the translation observer each time.
                const signature = `${type}|${displayMessage}`;
                if (signature === this.lastStatusHTML) return;
                this.lastStatusHTML = signature;

                let indicatorEl = statusElement.querySelector('.status-indicator');
                let textEl = statusElement.querySelector('.status-text');

                if (!indicatorEl || !textEl) {
                    statusElement.textContent = '';
                    indicatorEl = document.createElement('div');
                    indicatorEl.className = 'status-indicator';
                    textEl = document.createElement('span');
                    textEl.className = 'status-text';
                    statusElement.appendChild(indicatorEl);
                    statusElement.appendChild(textEl);
                }

                textEl.innerHTML = displayMessage;

                switch (type) {
                    case 'loading':
                        indicatorEl.style.background = '#f59e0b';
                        break;
                    case 'ready':
                        indicatorEl.style.background = '#4ade80';
                        break;
                    case 'error':
                        indicatorEl.style.background = '#ef4444';
                        break;
                }
            }
            

            showDataInsights() {
                const insightsHTML = `<div data-i18n="welcomeMsg">How can I help you today? <br><br>I am trained on the 2026/27 and 2026 DataMB Pro dataset (55 leagues). I can answer any question about the data and handle complex requests — from metric definitions to advanced analysis, scouting reports, and deeper insights. <br><br>Enable the graph toggle for on-demand charts and visual queries.</div>`;
                
                const insightMessage = this.createMessageContainer('assistant');
                insightMessage.classList.add('welcome-message');
                const contentDiv = insightMessage.querySelector('.message-content');
                contentDiv.innerHTML = insightsHTML;
            }

            showError(message) {
                const errorHTML = `
                    <div class="error">
                        ${message}
                    </div>
                `;
                
                const errorMessage = this.createMessageContainer('assistant');
                const contentDiv = errorMessage.querySelector('.message-content');
                contentDiv.innerHTML = errorHTML;
                try {
                    // If message matches known i18n errors, tag it
                    const map = {
                        'You must be logged in': 'errors.loginRequired'
              
                  };
          
              const key = map[message];
                    if (key) {
                        const errEl = contentDiv.querySelector('.error');
                        errEl.setAttribute('data-i18n', key);
                        window.translateElement && window.translateElement(errEl, window.currentTranslations);
                    }
                } catch (_) {}
            }

            ensureReplyBar() {
                if (this.replyBar) return this.replyBar;
                const wrap = this.messageInput && this.messageInput.closest('.input-container');
                if (!wrap) return null;
                const bar = document.createElement('div');
                bar.id = 'replyBar';
                bar.className = 'reply-bar hidden';
                bar.innerHTML = `
                    <div class="reply-bar-body">
                        <div class="reply-bar-label">${this.escapeHTML(this.t('reply.banner', 'Replying to'))}</div>
                        <div class="reply-bar-excerpt"></div>
                    </div>
                    <button type="button" class="reply-bar-close" aria-label="${this.escapeHTML(this.t('tooltips.cancelReply', 'Cancel reply'))}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                const inputWrapper = wrap.querySelector('.input-wrapper');
                wrap.insertBefore(bar, inputWrapper || wrap.firstChild);
                bar.querySelector('.reply-bar-close').addEventListener('click', () => this.clearReply());
                this.replyBar = bar;
                return bar;
            }

            startReplyTo(messageEl) {
                const raw = (messageEl.dataset.rawText || messageEl.querySelector('.message-content')?.innerText || '').trim();
                if (!raw) return;
                this.replyTo = {
                    role: messageEl.dataset.role || 'assistant',
                    text: raw,
                    id: messageEl.dataset.msgId
                };
                const bar = this.ensureReplyBar();
                if (bar) {
                    bar.classList.remove('hidden');
                    bar.querySelector('.reply-bar-excerpt').textContent = raw.replace(/\s+/g, ' ').slice(0, 160);
                }
                this.messageInput.focus();
            }

            clearReply() {
                this.replyTo = null;
                if (this.replyBar) this.replyBar.classList.add('hidden');
            }

            renderPlayerPicker(host, payload) {
                if (!host || !payload) return;
                host.querySelectorAll('.player-selector').forEach(el => el.remove());
                const wrap = document.createElement('div');
                wrap.className = 'player-selector';
                const title = document.createElement('div');
                title.className = 'player-selector-title';
                title.textContent = this.t('playerPicker.title', 'Which player did you mean?');
                wrap.appendChild(title);

                payload.players.forEach((player, index) => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'player-option';
                    if (index === payload.guessIndex) btn.classList.add('guess');
                    btn.dataset.index = String(index);
                    const minutes = Number.isFinite(Number(player.minutes))
                        ? ` · ${Number(player.minutes).toLocaleString()} ${this.t('playerPicker.minutes', 'min')}`
                        : '';
                    const age = Number.isFinite(Number(player.age)) ? ` · ${player.age}` : '';
                    btn.innerHTML = `
                        <div class="player-option-name">${this.escapeHTML(player.stored_name || '')}</div>
                        <div class="player-option-meta">${this.escapeHTML([player.team, player.league, player.position].filter(Boolean).join(' · '))}${this.escapeHTML(age)}${this.escapeHTML(minutes)}</div>
                        ${index === payload.guessIndex ? `<div class="player-option-guess">${this.escapeHTML(this.t('playerPicker.bestGuess', 'Best guess'))}</div>` : ''}
                    `;
                    wrap.appendChild(btn);
                });
                host.appendChild(wrap);
            }

            async handlePlayerChoice(optionEl) {
                if (!this.pendingPlayerCall || this.isSending) return;
                const index = Number(optionEl.dataset.index);
                const player = this.pendingPlayerCall.players[index];
                if (!player) return;

                const picker = optionEl.closest('.player-selector');
                if (picker) {
                    picker.querySelectorAll('.player-option').forEach(btn => {
                        btn.classList.add('disabled');
                        btn.disabled = true;
                    });
                    optionEl.classList.add('selected');
                }

                const callId = this.pendingPlayerCall.callId;
                this.pendingPlayerCall = null;

                const label = `${player.stored_name}${player.team ? ` (${player.team})` : ''}`;
                this.addMessage(label, 'user');

                await this.runModelTurn([{
                    type: 'function_call_output',
                    call_id: callId,
                    output: JSON.stringify({
                        selected: player.stored_name,
                        team: player.team || '',
                        league: player.league || '',
                        position: player.position || '',
                        age: player.age || null,
                        minutes: player.minutes || null,
                        instruction: 'Continue the original analysis using only this player row.'
                    })
                }]);
            }
            
            // Resolve league alias phrases to explicit league lists
            resolveLeagueAliases(text) {
                if (!text) return null;
                const t = text.toLowerCase();
                const top5 = ["Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1"];
                const top7 = ["Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1", "Liga Portugal", "Eredivisie"];
                const isTop5 = /(europe'?s\s*top\s*5|\btop\s*5\s*leagues\b|\bbig\s*5\b)/i.test(text);
                const isTop7 = /(europe'?s\s*top\s*7|\btop\s*7\s*leagues\b)/i.test(text);
                if (isTop7) {
                    return { name: "Europe's Top 7", list: top7 };
                }
                if (isTop5) {
                    return { name: "Europe's Top 5", list: top5 };
                }
                return null;
            }
        }

        // Cache clearing and reload functions for payment flow
        function clearCacheAndShowReload() {
            if (window.chatbot) {
                window.chatbot.quotaCache = {};
                                 const reloadButton = `<button onclick="window.location.reload()" class="payment-link" style="border: none; cursor: pointer; font-family: inherit;"><i class="fas fa-sync-alt"></i></button>`;
                
                const reloadMessage = `
                    <div class="reload-message" data-i18n="payment.reloadMessage">
                        Payment page opened in new tab. After completing payment, click the button below to refresh the page.
                    </div>
                    ${reloadButton}
                `;
                const messageContainer = window.chatbot.createMessageContainer('assistant');
                const contentDiv = messageContainer.querySelector('.message-content');
                contentDiv.innerHTML = reloadMessage;
            }
        }

 
        document.addEventListener('DOMContentLoaded', function() {
            window.chatbot = new UltimateFootballAI();
        });
        // Global toggle for collapsible tables
        function toggleTable(button) {
            const tableContainer = button.closest('.table-container');
            const isExpanded = tableContainer.classList.contains('expanded');
            if (isExpanded) {
                tableContainer.classList.remove('expanded');
                tableContainer.classList.add('collapsed');
                button.textContent = 'Show All';
            } else {
                tableContainer.classList.remove('collapsed');
                tableContainer.classList.add('expanded');
                button.textContent = 'Show Less';
            }
        }