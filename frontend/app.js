document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatContainer = document.getElementById('chat-container');
    const sendButton = document.getElementById('send-button');

    const API_URL = 'http://localhost:8000/chat';

    // Simple parser to format bold text, links, and linebreaks safely
    function formatResponseText(text) {
        if (!text) return '';
        // Escape HTML
        let formatted = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Convert markdown bold (**text**) to strong tags
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert markdown links [text](url) to anchor tags
        formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="maps-link">🔗 $1</a>');
        
        // Convert newlines to breaks
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    // Scroll to the bottom of the chat container
    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Append a message wrapper to the chat
    function appendMessage(sender, text) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', sender, 'animate-fade-in');

        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.innerText = sender === 'user' ? '👤' : '🤖';

        const bubble = document.createElement('div');
        bubble.classList.add('message-bubble');
        
        const content = document.createElement('p');
        content.innerHTML = sender === 'user' ? formatResponseText(text) : formatResponseText(text);
        
        bubble.appendChild(content);
        wrapper.appendChild(avatar);
        wrapper.appendChild(bubble);
        chatContainer.appendChild(wrapper);
        
        scrollToBottom();
        return wrapper;
    }

    // Append typing indicator bubble
    function appendTypingIndicator() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', 'assistant', 'animate-fade-in');
        wrapper.id = 'typing-indicator-wrapper';

        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.innerText = '🤖';

        const bubble = document.createElement('div');
        bubble.classList.add('message-bubble');

        const indicator = document.createElement('div');
        indicator.classList.add('typing-indicator');
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('typing-dot');
            indicator.appendChild(dot);
        }

        bubble.appendChild(indicator);
        wrapper.appendChild(avatar);
        wrapper.appendChild(bubble);
        chatContainer.appendChild(wrapper);
        
        scrollToBottom();
        return wrapper;
    }

    // Remove typing indicator bubble
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator-wrapper');
        if (indicator) {
            indicator.remove();
        }
    }

    let conversationHistory = [
        {
            role: "model",
            parts: [{ text: "Welcome! I am RestoFinder AI, your personal dining assistant. Tell me what kind of restaurant you are looking for and your location, and I will find the perfect spot for you! 🍔🍕🍣" }]
        }
    ];

    // Handle Form Submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) return;

        // Clear input & disable controls
        userInput.value = '';
        userInput.disabled = true;
        sendButton.disabled = true;

        // Add user message to UI
        appendMessage('user', message);

        // Add user message to history
        conversationHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Add typing indicator
        appendTypingIndicator();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ contents: conversationHistory })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Remove typing indicator & show response
            removeTypingIndicator();
            const botResponse = data.response || 'I did not receive a response. Please try again.';
            appendMessage('assistant', botResponse);

            // Add bot response to history
            conversationHistory.push({
                role: 'model',
                parts: [{ text: botResponse }]
            });

        } catch (error) {
            console.error('Error contacting RestoFinder AI:', error);
            removeTypingIndicator();
            appendMessage(
                'assistant', 
                '⚠️ **Connection error**: I was unable to connect to the backend server. Please verify the FastAPI server is running on `http://localhost:8000`.'
            );
            // Remove the user message from history as it failed
            conversationHistory.pop();
        } finally {
            // Re-enable input & controls
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    });
});
