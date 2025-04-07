document.addEventListener('DOMContentLoaded', function() {
    // العن��صر الرئيسية
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const newChatBtn = document.getElementById('new-chat');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const saveSettingsBtn = document.getElementById('save-settings');
    const clearHistoryBtn = document.getElementById('clear-history');
    const historyItems = document.getElementById('history-items');
    const quickQuestions = document.querySelectorAll('.quick-question');
    const voiceBtn = document.getElementById('voice-btn');
    const loadingModal = document.getElementById('loading-modal');
    const apiKeyInput = document.getElementById('api-key');
    const themeSelect = document.getElementById('theme-select');
    const fontSizeSelect = document.getElementById('font-size');

    // الحالة التطبيقية
    let currentChatId = generateChatId();
    let chats = JSON.parse(localStorage.getItem('h-ai-chats')) || {};
    let settings = JSON.parse(localStorage.getItem('h-ai-settings')) || {
        islamicMode: true,
        autoScroll: true,
        apiKey: 'AIzaSyC8EA5RHmUlGgLX_fOaP-khiQSdgtVk8OE',
        theme: 'default',
        fontSize: 'medium',
        suggestions: [
            'ما هي أركان الإسلام؟',
            'كيف أحل هذه المعادلة؟',
            'تفسير آية الكرسي'
        ]
    };

    // تهيئة التطبيق
    function initApp() {
        // تطبيق الإعدادات
        applySettings();
        
        // تحميل المحادثات السابقة
        loadChatHistory();
        
        // عرض محادثة الترحيب إذا لم تكن هناك محادثات
        if (Object.keys(chats).length === 0) {
            document.querySelector('.welcome-message').style.display = 'flex';
        } else {
            document.querySelector('.welcome-message').style.display = 'none';
        }
        
        // تحديث عنوان المحادثة الحالية
        updateChatTitle();
    }

    // توليد معرف محادثة فريد
    function generateChatId() {
        return 'chat-' + Date.now();
    }

    // تطبيق الإعدادات
    function applySettings() {
        // تطبيق مفتاح API
        apiKeyInput.value = settings.apiKey;
        
        // تطبيق الوضع الإسلامي
        document.getElementById('islamic-mode').checked = settings.islamicMode;
        
        // تطبيق التمرير التلقائي
        document.getElementById('auto-scroll').checked = settings.autoScroll;
        
        // تطبيق السمة
        themeSelect.value = settings.theme;
        document.documentElement.setAttribute('data-theme', settings.theme);
        
        // تطبيق حجم الخط
        fontSizeSelect.value = settings.fontSize;
        document.body.classList.remove('small-font', 'medium-font', 'large-font');
        document.body.classList.add(settings.fontSize + '-font');
        
        // تطبيق الاقتراحات السريعة
        document.getElementById('suggestion1').value = settings.suggestions[0];
        document.getElementById('suggestion2').value = settings.suggestions[1];
        document.getElementById('suggestion3').value = settings.suggestions[2];
    }

    // تحميل سجل المحادثات
    function loadChatHistory() {
        historyItems.innerHTML = '';
        
        for (const chatId in chats) {
            const chat = chats[chatId];
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item' + (chatId === currentChatId ? ' active' : '');
            historyItem.textContent = chat.title || 'محادثة بدون عنوان';
            historyItem.dataset.chatId = chatId;
            
            historyItem.addEventListener('click', function() {
                loadChat(chatId);
            });
            
            historyItems.appendChild(historyItem);
        }
    }

    // تحميل محادثة محددة
    function loadChat(chatId) {
        currentChatId = chatId;
        const chat = chats[chatId];
        
        // تحديث الواجهة
        document.querySelectorAll('.history-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.chatId === chatId) {
                item.classList.add('active');
            }
        });
        
        updateChatTitle();
        
        // عرض الرسائل
        chatMessages.innerHTML = '';
        if (chat.messages && chat.messages.length > 0) {
            chat.messages.forEach(message => {
                addMessageToChat(message.role, message.content);
            });
        } else {
            document.querySelector('.welcome-message').style.display = 'flex';
        }
    }

    // تحديث عنوان المحادثة الحالية
    function updateChatTitle() {
        const chat = chats[currentChatId];
        const titleElement = document.getElementById('current-chat-title');
        
        if (chat && chat.title) {
            titleElement.textContent = chat.title;
        } else {
            titleElement.textContent = 'محادثة جديدة';
        }
    }

    // إنشاء محادثة جديدة
    function createNewChat() {
        currentChatId = generateChatId();
        chats[currentChatId] = {
            id: currentChatId,
            title: 'محادثة جديدة',
            messages: [],
            createdAt: new Date().toISOString()
        };
        
        saveChats();
        loadChatHistory();
        loadChat(currentChatId);
        
        // عرض رسالة الترحيب
        chatMessages.innerHTML = '';
        document.querySelector('.welcome-message').style.display = 'flex';
    }

    // حفظ المحادثات في localStorage
    function saveChats() {
        localStorage.setItem('h-ai-chats', JSON.stringify(chats));
    }

    // إضافة رسالة إلى المحادثة
    function addMessageToChat(role, content) {
        // إخفاء رسالة الترحيب إذا كانت موجودة
        document.querySelector('.welcome-message').style.display = 'none';
        
        // إنشاء عنصر الرسالة
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message fade-in`;
        
        if (role === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">أنت</span>
                        <span class="message-time">الآن</span>
                    </div>
                    <div class="message-text">${content}</div>
                </div>
                <img src="user-icon.png" alt="User" class="message-avatar">
            `;
        } else {
            messageDiv.innerHTML = `
                <img src="ai-icon.png" alt="H.Ai" class="message-avatar">
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">H.Ai</span>
                        <span class="message-time">الآن</span>
                    </div>
                    <div class="message-text">${content}</div>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        
        // التمرير إلى الأسفل إذا كان التمرير التلقائي مفعلًا
        if (settings.autoScroll) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // تحديث عنوان المحادثة إذا كانت الرسالة الأولى
        if (role === 'user' && chats[currentChatId].messages.length === 0) {
            updateChatTitleFromMessage(content);
        }
    }

    // تحديث عنوان المحادثة من الرسالة الأولى
    function updateChatTitleFromMessage(message) {
        // استخراج أول 30 حرفًا من الرسالة كعنوان
        const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
        chats[currentChatId].title = title;
        updateChatTitle();
        saveChats();
        loadChatHistory();
    }

    // إرسال رسالة إلى الذكاء الاصطناعي
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // إضافة رسالة المستخدم إلى الواجهة والمحادثة
        addMessageToChat('user', message);
        chats[currentChatId].messages.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
        
        // مسح حقل الإدخال
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // إظهار مؤشر التحميل
        loadingModal.style.display = 'flex';
        
        try {
            // إرسال الرسالة إلى Gemini API
            const aiResponse = await getAIResponse(message);
            
            // إضافة رد الذكاء الاصطناعي إلى الواجهة والمحادثة
            addMessageToChat('ai', aiResponse);
            chats[currentChatId].messages.push({
                role: 'ai',
                content: aiResponse,
                timestamp: new Date().toISOString()
            });
            
            // حفظ المحادثة
            saveChats();
        } catch (error) {
            console.error('Error:', error);
            addMessageToChat('ai', 'عذرًا، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.');
        } finally {
            // إخفاء مؤشر التحميل
            loadingModal.style.display = 'none';
        }
    }

    // الحصول على رد من Gemini API
    async function getAIResponse(message) {
        const apiKey = settings.apiKey;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        
        // تحضير النص مع السياق الإسلامي إذا كان مفعلًا
        const context = settings.islamicMode ? 
            "أنت مساعد إسلامي سلفي تتحدث باللغة العربية الفصحى. يجب أن تلتزم بالمنهج السلفي في الإجابات، وتستشهد بالقرآن والسنة بفهم السلف الصالح. قدم إجابات واضحة ومختصرة." :
            "أنت مساعد ذكي يتحدث العربية. قدم إجابات دقيقة ومفيدة.";
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: `${context}\n\nالسؤال: ${message}\nالجواب:`
                }]
            }]
        };
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('No response from AI');
        }
    }

    // مسح سجل المحادثات
    function clearChatHistory() {
        if (confirm('هل أنت متأكد أنك تريد مسح جميع المحادثات؟')) {
            chats = {};
            currentChatId = generateChatId();
            chats[currentChatId] = {
                id: currentChatId,
                title: 'محادثة جديدة',
                messages: [],
                createdAt: new Date().toISOString()
            };
            
            saveChats();
            loadChatHistory();
            loadChat(currentChatId);
            
            // عرض رسالة الترحيب
            chatMessages.innerHTML = '';
            document.querySelector('.welcome-message').style.display = 'flex';
        }
    }

    // حفظ الإعدادات
    function saveSettings() {
        settings = {
            islamicMode: document.getElementById('islamic-mode').checked,
            autoScroll: document.getElementById('auto-scroll').checked,
            apiKey: apiKeyInput.value,
            theme: themeSelect.value,
            fontSize: fontSizeSelect.value,
            suggestions: [
                document.getElementById('suggestion1').value,
                document.getElementById('suggestion2').value,
                document.getElementById('suggestion3').value
            ]
        };
        
        localStorage.setItem('h-ai-settings', JSON.stringify(settings));
        applySettings();
        settingsModal.style.display = 'none';
        
        // تحديث الأسئلة السريعة
        updateQuickQuestions();
    }

    // تحديث الأسئلة السريعة
    function updateQuickQuestions() {
        const questions = document.querySelectorAll('.quick-question');
        questions[0].textContent = settings.suggestions[0];
        questions[1].textContent = settings.suggestions[1];
        questions[2].textContent = settings.suggestions[2];
    }

    // تهيئة التعرف على الصوت
    function initVoiceRecognition() {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'ar-SA';
        
        voiceBtn.addEventListener('click', function() {
            if (voiceBtn.classList.contains('recording')) {
                recognition.stop();
                voiceBtn.classList.remove('recording');
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            } else {
                recognition.start();
                voiceBtn.classList.add('recording');
                voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            }
        });
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            voiceBtn.classList.remove('recording');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        };
        
        recognition.onerror = function(event) {
            console.error('Voice recognition error', event.error);
            voiceBtn.classList.remove('recording');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        };
    }

    // تكبير مربع النص تلقائيًا
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // إرسال الرسالة عند الضغط على Enter
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // الأحداث
    sendButton.addEventListener('click', sendMessage);
    newChatBtn.addEventListener('click', createNewChat);
    settingsBtn.addEventListener('click', function() {
        settingsModal.style.display = 'flex';
    });
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            settingsModal.style.display = 'none';
        });
    });
    saveSettingsBtn.addEventListener('click', saveSettings);
    clearHistoryBtn.addEventListener('click', clearChatHistory);
    
    // تبديل تبويبات الإعدادات
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab + '-tab';
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // الأسئلة السريعة
    quickQuestions.forEach(question => {
        question.addEventListener('click', function() {
            userInput.value = this.textContent;
            userInput.focus();
        });
    });
    
    // تهيئة التعرف على الصوت إذا كان مدعومًا
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        initVoiceRecognition();
    } else {
        voiceBtn.style.display = 'none';
    }
    
    // بدء التطبيق
    initApp();
});