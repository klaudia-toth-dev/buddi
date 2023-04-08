// import bot from "./assets/bot.svg";
// import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
let loadInterval;
let step = 0;
let q0 = "";
let q1 = "";
let q2 = "";

function loader(element) {
    element.textContent = "";

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += ".";

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === "....") {
            element.textContent = "";
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return `
        <div class="wrapper ${isAi && "ai"}">
            <div class="chat">
                <div class="profile">
                    <span>${isAi ? "BUDDI" : "You"}</span>
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
}

function additionalQuestions(question_id, value) {
    return `
        <div class="wrapper ai">
                <div class="chat">
                    <div class="profile">
                        <span>BUDDI</span>
                    </div>
                    <div class="message" id=${question_id}>${value}</div>
                </div>
            </div>
    `;
}

const handleSubmit = async(e) => {
    e.preventDefault();

    const data = new FormData(form);

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

    // to clear the textarea input
    form.reset();

    if (step == 0) {
        q0 = data.get("prompt");
        step++;

        clearInterval(loadInterval);
        chatContainer.innerHTML += additionalQuestions(
            "q1",
            "What should the tutorial be about?"
        );
    } else if (step == 1) {
        q1 = data.get("prompt");
        step++;

        clearInterval(loadInterval);
        chatContainer.innerHTML += additionalQuestions(
            "q1",
            "How long time should the user spend on the tutorial?"
        );
    } else if (step == 2) {
        q2 = data.get("prompt");

        // bot's chatstripe
        const uniqueId = generateUniqueId();
        chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

        // to focus scroll to the bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // specific message div
        const messageDiv = document.getElementById(uniqueId);

        // messageDiv.innerHTML = "..."
        loader(messageDiv);

        // console.log(q2, "q2");
        const response = await fetch("http://localhost:3000", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // prompt: data.get("prompt"),
                q0: q0,
                q1: q1,
                q2: q2,
            }),
        });

        clearInterval(loadInterval);
        messageDiv.innerHTML = " ";

        if (response.ok) {
            const data = await response.json();
            const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

            typeText(messageDiv, parsedData);
        } else {
            const err = await response.text();

            messageDiv.innerHTML = "Something went wrong";
            alert(err);
        }
    }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
});