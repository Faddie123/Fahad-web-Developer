
const canvas = document.getElementById("glitchCanvas");
const ctx = canvas.getContext("2d");

const colors = ["#5e4491", "#A476FF", "#241a38"];
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
const fontSize = 16;

let columns, rows, grid;

function randomChar() {
    return characters[Math.floor(Math.random() * characters.length)];
}

function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    columns = Math.ceil(rect.width / fontSize);
    rows = Math.ceil(rect.height / fontSize);

    grid = Array.from({ length: columns }, () =>
        Array.from({ length: rows }, () => ({
            char: randomChar(),
            color: randomColor()
        }))
    );
}

function animate() {
    const rect = canvas.getBoundingClientRect();

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";

    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            const cell = grid[x][y];

            if (Math.random() < 0.03) {
                cell.char = randomChar();
                cell.color = randomColor();
            }

            ctx.fillStyle = cell.color;
            ctx.fillText(
                cell.char,
                x * fontSize,
                y * fontSize
            );
        }
    }

    requestAnimationFrame(animate);
}

resizeCanvas();
animate();

window.addEventListener("resize", resizeCanvas);

(() => {
    const navigation = document.querySelector(".navigation");
    const links = [...document.querySelectorAll(".navigation .nav-link")];
    if (!navigation || links.length === 0) {
        throw new Error("The main navigation could not be initialized.");
    }

    const sections = links.map((link) => {
        const section = document.querySelector(link.getAttribute("href"));
        if (!section) {
            throw new Error(`The navigation target for "${link.textContent.trim()}" is missing.`);
        }
        return section;
    });

    let updateScheduled = false;
    function updateActiveLink() {
        updateScheduled = false;
        navigation.classList.toggle("is-scrolled", window.scrollY > 24);
        const activationLine = window.innerHeight * 0.38;
        let activeIndex = 0;
        sections.forEach((section, index) => {
            if (section.getBoundingClientRect().top <= activationLine) {
                activeIndex = index;
            }
        });

        links.forEach((link, index) => {
            const isActive = index === activeIndex;
            link.classList.toggle("active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    function scheduleActiveLinkUpdate() {
        if (!updateScheduled) {
            updateScheduled = true;
            window.requestAnimationFrame(updateActiveLink);
        }
    }

    window.addEventListener("scroll", scheduleActiveLinkUpdate, { passive: true });
    window.addEventListener("resize", scheduleActiveLinkUpdate);
    updateActiveLink();
})();

(() => {
    const likeButton = document.querySelector(".like-button");
    const likeLabel = likeButton?.querySelector("span");
    if (!likeButton || !likeLabel) {
        throw new Error("The footer like button could not be initialized.");
    }

    likeButton.addEventListener("click", () => {
        const liked = likeButton.getAttribute("aria-pressed") !== "true";
        likeButton.setAttribute("aria-pressed", String(liked));
        likeLabel.textContent = liked ? "1 Like" : "0 Likes";
    });
})();

(() => {
    const contactForm = document.querySelector("#contact-form");
    const contactStatus = document.querySelector("#contact-form-status");
    if (!contactForm || !contactStatus) {
        throw new Error("The contact form could not be initialized.");
    }

    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(contactForm);
        const name = formData.get("name");
        const email = formData.get("email");
        const message = formData.get("message");
        if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
            throw new Error("The contact form contains invalid data.");
        }

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedMessage = message.trim();
        if (!trimmedName || !trimmedEmail || !trimmedMessage) {
            contactStatus.textContent = "Please complete all fields before sending.";
            return;
        }

        const subject = encodeURIComponent(`Portfolio enquiry from ${trimmedName}`);
        const body = encodeURIComponent(`Name: ${trimmedName}\nEmail: ${trimmedEmail}\n\n${trimmedMessage}`);
        contactStatus.textContent = "Your email app should open with your message.";
        window.location.href = `mailto:fahadmian612@gmail.com?subject=${subject}&body=${body}`;
    });
})();

(() => {
    const carousel = document.querySelector(".skills-carousel");
    const track = document.querySelector("#skills-track");
    const previousButton = document.querySelector(".skills-arrow-previous");
    const nextButton = document.querySelector(".skills-arrow-next");
    if (!carousel || !track || !previousButton || !nextButton) {
        throw new Error("The technologies carousel could not be initialized.");
    }

    const sourceSkills = [...track.querySelectorAll(".skill")];
    const firstGroup = document.createElement("div");
    firstGroup.className = "skills-group";
    firstGroup.setAttribute("role", "presentation");
    sourceSkills.forEach((skill) => firstGroup.appendChild(skill));
    track.appendChild(firstGroup);

    const secondGroup = firstGroup.cloneNode(true);
    secondGroup.setAttribute("aria-hidden", "true");
    track.appendChild(secondGroup);

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    function updateCarousel() {
        const firstItem = firstGroup.querySelector(".skill");
        const lastItem = firstGroup.lastElementChild;
        if (!firstItem || !lastItem) {
            throw new Error("The technologies carousel has no items.");
        }
        const groupWidth = lastItem.getBoundingClientRect().right - firstItem.getBoundingClientRect().left;
        carousel.classList.toggle("has-overflow", groupWidth > track.clientWidth);
    }

    previousButton.addEventListener("click", () => {
        track.scrollBy({ left: -track.clientWidth * 0.75, behavior: "smooth" });
    });
    nextButton.addEventListener("click", () => {
        track.scrollBy({ left: track.clientWidth * 0.75, behavior: "smooth" });
    });
    track.addEventListener("scroll", updateCarousel, { passive: true });
    new ResizeObserver(updateCarousel).observe(track);
    updateCarousel();

    let lastFrameTime = 0;
    function animateSkills(timestamp) {
        if (lastFrameTime && !motionPreference.matches && !document.hidden &&
            !carousel.matches(":hover") && !carousel.contains(document.activeElement)) {
            const firstItem = firstGroup.querySelector(".skill");
            const lastItem = firstGroup.lastElementChild;
            if (!firstItem || !lastItem) {
                throw new Error("The technologies carousel has no items.");
            }
            const loopDistance = lastItem.getBoundingClientRect().right -
                firstItem.getBoundingClientRect().left + 24;
            if (loopDistance > 0) {
                track.scrollLeft += (timestamp - lastFrameTime) * 0.035;
                if (track.scrollLeft >= loopDistance) {
                    track.scrollLeft -= loopDistance;
                }
            }
        }
        lastFrameTime = timestamp;
        window.requestAnimationFrame(animateSkills);
    }

    window.requestAnimationFrame(animateSkills);
})();
