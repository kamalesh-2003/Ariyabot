const chatInput = document.querySelector(".chat-input");
const sendButton = document.querySelector(".send-btn");
const chatContainer = document.querySelector(".chat-container");
const deleteButton = document.querySelector(".delete-btn");
const themeButton = document.querySelector(".theme-btn");

const API_KEY = "";
let UserText = null;

const loadDataFromLocalStorage = () => {
  const themeColor = localStorage.getItem("themeColor");
  document.body.classList.toggle("light-mode", themeColor === "light_mode");
  themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";

    const defaultText = `<div class="default-text">
    <div class="grey-box">
      <h2><div style="color:#59c2a2;">Powerful</div> - Based on Google's LLM model</h2>
      <h2><div style="color:#bd644b;">Natural</div> - Engineered to give the most human responses</h2>
      <h2><div style="color:green;">Versatile</div> - Can answer a wide range of questions</h2>
      <h2><div style="color:#12C2E9;">Safe</div> - No hidden cookies and chat refreshes after each session</h2>
    </div>
  </div>`;
  

  chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const createChatElement = (content, className) => {
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat", className);
  chatDiv.innerHTML = content;
  return chatDiv;
};

const getChatResponse = async (inChatDiv) => {
  const API_ENDPOINT =
    "https://generativelanguage.googleapis.com/v1beta3/models/chat-bison-001:generateMessage?key=" +
    API_KEY;

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: {
        context: "Your name is Ariya, You are from the amazing world called internetopolis,Speak in a colloquial and extremely friendly tone, Use more idioms ,give more specific examples when asked to generate content or to rephrase ,please play along and only reply with these lines",
        examples: [],
        messages: [
          {
            content:  UserText,
          },
        ],
      },
      temperature: 0.25,
      top_k: 40,
      top_p: 0.95,
      candidate_count: 1,
    }),
  };

  try {
    const response = await fetch(API_ENDPOINT, requestOptions);
    const data = await response.json();

  
    if (
      data.filters &&
      data.filters.length > 0 &&
      data.filters[0].reason === "OTHER"
    ) {
      inChatDiv.querySelector(".typing-animation").remove();
      const errorMessage = "Sorry, I can't assist you with this.";
      const errorElement = document.createElement("p");
      errorElement.textContent = errorMessage;
      inChatDiv.querySelector(".chat-details").appendChild(errorElement);
    } else if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content
    ) {
      inChatDiv.querySelector(".typing-animation").remove();
      const message = data.candidates[0].content;
      const messageElement = document.createElement("p");
      messageElement.textContent = message;
      inChatDiv.querySelector(".chat-details").appendChild(messageElement);
    } else {
      throw new Error("API call failed");
    }
  } catch (error) {
    inChatDiv.querySelector(".typing-animation").remove();
    const errorElement = document.createElement("p");
    errorElement.classList.add("error");
    errorElement.textContent =
      "Oops! Something went wrong while retrieving the response. Please try again.";
    inChatDiv.querySelector(".chat-details").appendChild(errorElement);
  }

  localStorage.setItem("all-chats", chatContainer.innerHTML);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const copyResponse = (copyBtn) => {
  const responseTextElement = copyBtn.parentElement.querySelector("p");
  navigator.clipboard.writeText(responseTextElement.textContent);
  copyBtn.textContent = "done";
  setTimeout(() => (copyBtn.textContent = "content_copy"), 1000);
};

const showTypingAnimation = () => {
  const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="./img/robot.png" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
  const inChatDiv = createChatElement(html, "incoming");
  chatContainer.appendChild(inChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  getChatResponse(inChatDiv);
};

const handleOutgoingChat = () => {
  UserText = chatInput.value.trim();
  if (!UserText) return;

  chatInput.value = "";
  chatInput.style.height = `${initialInputHeight}px`;

  const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="./img/user.png" alt="user-img">
                        <p>${UserText}</p>
                    </div>
                </div>`;

  const outChatDiv = createChatElement(html, "outgoing");
  chatContainer.querySelector(".default-text")?.remove();
  chatContainer.appendChild(outChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(showTypingAnimation, 500);
  getChatResponse(outChatDiv);
};

deleteButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("all-chats");
    loadDataFromLocalStorage();
  }
});

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("themeColor", themeButton.innerText);
  themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
  chatInput.style.height = `${initialInputHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleOutgoingChat();
  }
});

loadDataFromLocalStorage();
sendButton.addEventListener("click", handleOutgoingChat);
