


"use strict";

// =========================================================

// Performs browser-side validation and gives clear feedback.
// Connect a backend or form service for actual message delivery.
// =========================================================

function initialiseContactForm() {
    const form = document.querySelector("#contact-form");
    const status = document.querySelector("#contact-form-status");

    if (!form || !status) return;

    form.addEventListener("submit", (event) => {
        // Keep the browser from submitting to a nonexistent endpoint.
        event.preventDefault();

        // Use native HTML validation for required fields and email format.
        if (!form.checkValidity()) {
            form.reportValidity();
            status.textContent = "Please check the required fields and try again.";
            return;
        }

        // The form is valid, but no delivery service is configured yet.
        status.textContent =
            "Your details look good, but online message delivery is not connected yet. Please contact us by email.";

        // Avoid clearing the visitor's message before delivery is available.
    });

    // Prevent placeholder social links from jumping the page to the top.
    document.querySelectorAll("[data-placeholder-link]").forEach((link) => {
        link.addEventListener("click", (event) => {
            if (link.getAttribute("href") === "#") {
                event.preventDefault();
            }
        });
    });
}


// =========================================================

// Updates page progress and provides accessible back-to-top.
// =========================================================

function initialiseFooter() {
    const backToTopButton = document.querySelector("#back-to-top");
    const progressCircle = document.querySelector("#page-progress");

    if (!backToTopButton || !progressCircle) return;

    const circumference = 2 * Math.PI * 21;
    progressCircle.style.strokeDasharray = String(circumference);
    progressCircle.style.strokeDashoffset = String(circumference);

    let animationFrame = null;

    // Calculate scroll progress without updating layout on every event.
    function updatePageProgress() {
        animationFrame = null;

        const scrollableHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        const progress = scrollableHeight > 0
            ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
            : 0;

        progressCircle.style.strokeDashoffset = String(
            circumference * (1 - progress)
        );
    }

    function requestProgressUpdate() {
        if (animationFrame !== null) return;

        animationFrame = window.requestAnimationFrame(updatePageProgress);
    }

    // Scroll to the top, respecting the visitor's motion preferences.
    backToTopButton.addEventListener("click", () => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? "auto" : "smooth"
        });
    });

    window.addEventListener("scroll", requestProgressUpdate, {
        passive: true
    });

    window.addEventListener("resize", requestProgressUpdate, {
        passive: true
    });

    // Set the correct indicator position on initial page load.
    updatePageProgress();
}



function initialiseCollectionCards() {
    const cards = document.querySelectorAll(
        ".collection-card[data-interactive-card]"
    );

    if (!cards.length) return;

    // Pointer tracking is only needed on devices with a precise pointer.
    const supportsHover = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;

    if (!supportsHover) return;

    cards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            const bounds = card.getBoundingClientRect();

            // Store pointer coordinates as CSS variables.
            // CSS uses these values to position the soft highlight.
            const x = ((event.clientX - bounds.left) / bounds.width) * 100;
            const y = ((event.clientY - bounds.top) / bounds.height) * 100;

            card.style.setProperty("--card-pointer-x", `${x}%`);
            card.style.setProperty("--card-pointer-y", `${y}%`);
        });
    });
}



function initialiseSilkGallery() {
    const gallery = document.querySelector("#silk-gallery");

    if (!gallery) return;

    const featuredImage = gallery.querySelector("#silk-gallery-image");
    const caption = gallery.querySelector("#silk-gallery-caption");
    const subcaption = gallery.querySelector("#silk-gallery-subcaption");
    const counter = gallery.querySelector("#silk-gallery-index");
    const thumbnails = Array.from(
        gallery.querySelectorAll("[data-gallery-index]")
    );

    if (!featuredImage || !caption || !subcaption || !counter || !thumbnails.length) {
        return;
    }

    // Keep gallery content in one data source for easy maintenance.
    const galleryItems = [
        {
            src: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85",
            alt: "Silk textile in rich traditional colours",
            title: "The timeless weave",
            description: "Texture that tells a story."
        },
        {
            src: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1600&q=85",
            alt: "Textile-inspired colours and materials",
            title: "Colour and character",
            description: "A palette inspired by tradition."
        },
        {
            src: "assets/images/occasionEdit.jpeg",
            alt: "Model wearing an ornate deep burgundy silk saree",
            title: "The occasion edit",
            description: "Occasion wear in richly woven burgundy silk."
        },
        {
            src: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=85",
            alt: "Elegant fabric styling and textile details",
            title: "Timeless elegance",
            description: "A quiet expression of personal style."
        }
    ];

    let activeIndex = 0;
    let transitionToken = 0;

    function selectGalleryImage(index) {
        const item = galleryItems[index];

        if (!item || index === activeIndex) return;

        activeIndex = index;
        transitionToken += 1;

        const currentToken = transitionToken;
        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        thumbnails.forEach((thumbnail, thumbnailIndex) => {
            const isActive = thumbnailIndex === index;

            thumbnail.classList.toggle("is-active", isActive);
            thumbnail.setAttribute("aria-pressed", String(isActive));
        });

        counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(galleryItems.length).padStart(2, "0")}`;
        caption.textContent = item.title;
        subcaption.textContent = item.description;

        function updateImage() {
            if (currentToken !== transitionToken) return;

            featuredImage.src = item.src;
            featuredImage.alt = item.alt;
            featuredImage.classList.remove("is-changing");
        }

        if (reducedMotion) {
            updateImage();
            return;
        }

        featuredImage.classList.add("is-changing");

        // Match the CSS fade duration before switching the image.
        window.setTimeout(updateImage, 180);
    }

    thumbnails.forEach((thumbnail) => {
        const index = Number(thumbnail.dataset.galleryIndex);

        thumbnail.addEventListener("click", () => {
            selectGalleryImage(index);
        });
    });

    // Keep the initial caption and counter aligned with the first image.
    const initialItem = galleryItems[0];
    featuredImage.alt = initialItem.alt;
    caption.textContent = initialItem.title;
    subcaption.textContent = initialItem.description;
    counter.textContent = `01 / ${String(galleryItems.length).padStart(2, "0")}`;
}



function initialisePreloader() {
    const preloader = document.querySelector("#site-preloader");

    if (!preloader) return;

    const root = document.documentElement;
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // Prevent scrolling only while the short intro is visible.
    root.classList.add("preloader-active");

    let hasFinished = false;

    function finishPreloader() {
        if (hasFinished) return;

        hasFinished = true;
        preloader.classList.add("is-finished");
        root.classList.remove("preloader-active");

        // Remove the overlay after its exit transition.
        window.setTimeout(() => {
            preloader.remove();
        }, reducedMotion ? 0 : 1000);
    }

    // Respect reduced-motion settings without delaying the page.
    if (reducedMotion) {
        finishPreloader();
        return;
    }

    // Keep the introduction visible long enough to read, without
    // waiting indefinitely for page assets to finish loading.
    window.setTimeout(finishPreloader, 1000);
}




function initialiseCustomCursor() {
    const cursor = document.querySelector("#custom-cursor");

    if (!cursor) return;

    const canUseCustomCursor = window.matchMedia(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    ).matches;

    // Leave native cursors untouched on mobile and reduced-motion setups.
    if (!canUseCustomCursor) return;

    const root = document.documentElement;
    const interactiveElements = document.querySelectorAll(
        "a, button, [role='button'], input, select, textarea, label"
    );

    let pointerX = -100;
    let pointerY = -100;
    let animationFrame = null;

    function renderCursor() {
        animationFrame = null;

        cursor.style.left = `${pointerX}px`;
        cursor.style.top = `${pointerY}px`;
    }

    function handlePointerMove(event) {
        pointerX = event.clientX;
        pointerY = event.clientY;

        if (animationFrame === null) {
            animationFrame = window.requestAnimationFrame(renderCursor);
        }
    }

    function handlePointerEnter() {
        root.classList.add("has-custom-cursor");
    }

    function handlePointerLeave() {
        root.classList.remove("has-custom-cursor");
        cursor.classList.remove("is-hovering", "is-view");
    }

    function handleInteractiveEnter(event) {
        const element = event.currentTarget;
        cursor.classList.add("is-hovering");

        // Show the VIEW label on collection cards and gallery images.
        const isVisualTarget = element.closest(
            ".collection-card, .silk-gallery__featured, .silk-gallery__thumbnail"
        );

        if (isVisualTarget) {
            cursor.classList.add("is-view");
        }
    }

    function handleInteractiveLeave() {
        cursor.classList.remove("is-hovering", "is-view");
    }

    document.addEventListener("pointermove", handlePointerMove, {
        passive: true
    });

    document.addEventListener("pointerenter", handlePointerEnter);
    document.addEventListener("pointerleave", handlePointerLeave);

    interactiveElements.forEach((element) => {
        element.addEventListener("pointerenter", handleInteractiveEnter);
        element.addEventListener("pointerleave", handleInteractiveLeave);
    });
}



function initialiseScrollProgress() {
    const progress = document.querySelector("#scroll-progress");
    const progressBar = document.querySelector("#scroll-progress-bar");

    if (!progress || !progressBar) return;

    let animationFrame = null;

    function updateProgress() {
        animationFrame = null;

        const documentHeight = document.documentElement.scrollHeight;
        const scrollableHeight = documentHeight - window.innerHeight;

        const scrollPosition = Math.max(0, window.scrollY);
        const percentage = scrollableHeight > 0
            ? Math.min(1, scrollPosition / scrollableHeight)
            : 0;

        progressBar.style.transform = `scaleX(${percentage})`;
        progress.classList.toggle("is-active", scrollPosition > 20);
    }

    function requestUpdate() {
        if (animationFrame !== null) return;

        animationFrame = window.requestAnimationFrame(updateProgress);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    // Set the correct initial value without waiting for a scroll event.
    updateProgress();
}



function initialiseTestimonials() {
    const section = document.querySelector("#testimonials");
    if (!section) return;

    const content = section.querySelector("#testimonial-content");
    const quote = section.querySelector("#testimonial-quote");
    const name = section.querySelector("#testimonial-name");
    const detail = section.querySelector("#testimonial-detail");
    const indexLabel = section.querySelector("#testimonial-index");
    const previousButton = section.querySelector("#testimonial-previous");
    const nextButton = section.querySelector("#testimonial-next");
    const dots = Array.from(
        section.querySelectorAll("[data-testimonial-index]")
    );

    if (
        !content || !quote || !name || !detail ||
        !indexLabel || !previousButton || !nextButton || !dots.length
    ) {
        return;
    }

    // Replace these illustrative entries with verified customer feedback.
    const testimonials = [
        {
            quote: "The beauty is in the details — the texture, the colour, and the feeling of wearing something truly special.",
            name: "Customer name",
            detail: "Customer feedback"
        },
        {
            quote: "A beautiful reminder that thoughtful design and timeless style never need to compete for attention.",
            name: "Customer name",
            detail: "Customer feedback"
        },
        {
            quote: "The smallest details can make a piece memorable. That is what makes a considered textile experience special.",
            name: "Customer name",
            detail: "Customer feedback"
        }
    ];

    let activeIndex = 0;
    let transitionTimer = null;

    function showTestimonial(index) {
        const nextIndex = (index + testimonials.length) % testimonials.length;
        if (nextIndex === activeIndex) return;

        activeIndex = nextIndex;
        const item = testimonials[activeIndex];

        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === activeIndex;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-pressed", String(isActive));
        });

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        function updateContent() {
            quote.textContent = item.quote;
            name.textContent = item.name;
            detail.textContent = item.detail;
            indexLabel.innerHTML =
                `${String(activeIndex + 1).padStart(2, "0")} <span>/</span> ${String(testimonials.length).padStart(2, "0")}`;

            content.classList.remove("is-changing");
        }

        window.clearTimeout(transitionTimer);

        if (reducedMotion) {
            updateContent();
            return;
        }

        content.classList.add("is-changing");
        transitionTimer = window.setTimeout(updateContent, 260);
    }

    previousButton.addEventListener("click", () => {
        showTestimonial(activeIndex - 1);
    });

    nextButton.addEventListener("click", () => {
        showTestimonial(activeIndex + 1);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showTestimonial(index);
        });
    });
}



function initialiseFAQ() {
    const faqList = document.querySelector("#faq-list");

    if (!faqList) return;

    const items = Array.from(faqList.querySelectorAll(".faq-item"));

    if (!items.length) return;

    function setItemState(item, shouldOpen) {
        const button = item.querySelector(".faq-item__trigger");
        const panel = item.querySelector(".faq-item__panel");

        if (!button || !panel) return;

        item.classList.toggle("is-open", shouldOpen);
        button.setAttribute("aria-expanded", String(shouldOpen));

        // Keep closed panels out of the keyboard and accessibility tree.
        if (shouldOpen) {
            panel.hidden = false;
        } else {
            panel.hidden = true;
        }
    }

    items.forEach((item) => {
        const button = item.querySelector(".faq-item__trigger");

        if (!button) return;

        button.addEventListener("click", () => {
            const isCurrentlyOpen =
                button.getAttribute("aria-expanded") === "true";

            // Only one answer stays open at a time.
            items.forEach((otherItem) => {
                setItemState(otherItem, false);
            });

            // Clicking an open question closes it.
            if (!isCurrentlyOpen) {
                setItemState(item, true);
            }
        });
    });

    // Normalise the initial HTML to one open answer.
    const initiallyOpen = items.find((item) =>
        item.classList.contains("is-open")
    );

    items.forEach((item) => {
        setItemState(item, item === initiallyOpen);
    });
}


document.addEventListener("DOMContentLoaded", () => {
    initialiseNavigation();
    initialiseHeroMotion();
    initialiseScrollReveals();
    initialiseStoryMotion();
    initialiseCraftTimeline();
    initialiseContactForm();
    initialiseFooter();
    initialiseCollectionCards();
    initialiseSilkGallery();
    initialisePreloader();
    initialiseCustomCursor();
    initialiseScrollProgress();
    initialiseTestimonials();
    initialiseFAQ();
    initialiseSilkJournal();
    initialiseFeaturedSilk();
});


/**
 * Initialises all header and navigation behaviour.
 */
function initialiseNavigation() {
    const header = document.querySelector("#site-header");
    const menuToggle = document.querySelector("#menu-toggle");
    const navigationLinks = document.querySelector("#navigation-links");

    // Fail safely if the expected HTML elements are missing.
    if (!header || !menuToggle || !navigationLinks) {
        console.warn("Silk Weaver: navigation elements were not found.");
        return;
    }

    const mobileBreakpoint = window.matchMedia("(max-width: 700px)");

    let menuIsOpen = false;
    let previousScrollY = window.scrollY;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    /* --------------------------------------------------------
       01. STICKY HEADER
       Switch from the transparent hero state to the paper state.
       -------------------------------------------------------- */

    function updateHeader() {
        const currentScrollY = window.scrollY;

        header.classList.toggle(
            "is-scrolled",
            currentScrollY > 35
        );

        previousScrollY = currentScrollY;
    }

    // Passive scrolling improves responsiveness.
    window.addEventListener("scroll", updateHeader, {
        passive: true
    });

    updateHeader();


    /* --------------------------------------------------------
       02. MOBILE MENU STATE
       A single function keeps CSS classes and ARIA attributes
       synchronised.
       -------------------------------------------------------- */

    function setMenuOpen(shouldOpen) {
        // The full-screen menu is only available on mobile.
        const open = Boolean(shouldOpen) && mobileBreakpoint.matches;

        menuIsOpen = open;

        navigationLinks.classList.toggle("is-open", open);
        header.classList.toggle("menu-open", open);
        document.body.classList.toggle("menu-open", open);

        menuToggle.setAttribute(
            "aria-expanded",
            String(open)
        );

        menuToggle.setAttribute(
            "aria-label",
            open
                ? "Close navigation menu"
                : "Open navigation menu"
        );

        // Hide the inactive menu from keyboard navigation.
        navigationLinks.setAttribute(
            "aria-hidden",
            String(!open && mobileBreakpoint.matches)
        );

        // Move keyboard focus into the menu when it opens.
        if (open) {
            const firstLink = navigationLinks.querySelector("a");

            if (firstLink) {
                firstLink.focus({ preventScroll: true });
            }
        }
    }


    /* --------------------------------------------------------
       03. MENU BUTTON
       Opens or closes the animated navigation overlay.
       -------------------------------------------------------- */

    menuToggle.addEventListener("click", () => {
        setMenuOpen(!menuIsOpen);
    });


    /* --------------------------------------------------------
       04. NAVIGATION LINK ACTIONS
       Close the mobile menu after selecting a destination.
       -------------------------------------------------------- */

    navigationLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            setMenuOpen(false);
        });
    });

    // Clicking unused space in the overlay closes the menu.
    navigationLinks.addEventListener("click", (event) => {
        if (event.target === navigationLinks) {
            setMenuOpen(false);
        }
    });


    /* --------------------------------------------------------
       05. KEYBOARD SUPPORT
       Escape closes the menu; focus returns to the menu button.
       -------------------------------------------------------- */

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuIsOpen) {
            setMenuOpen(false);
            menuToggle.focus({ preventScroll: true });
        }
    });


    /* --------------------------------------------------------
       06. VIEWPORT CHANGES
       Prevent the mobile overlay from remaining open when
       switching to the desktop layout.
       -------------------------------------------------------- */

    function handleBreakpointChange() {
        if (!mobileBreakpoint.matches) {
            setMenuOpen(false);
        } else {
            navigationLinks.setAttribute(
                "aria-hidden",
                String(!menuIsOpen)
            );
        }
    }

    if (typeof mobileBreakpoint.addEventListener === "function") {
        mobileBreakpoint.addEventListener(
            "change",
            handleBreakpointChange
        );
    } else {
        // Compatibility fallback for older Safari versions.
        mobileBreakpoint.addListener(handleBreakpointChange);
    }


    /* --------------------------------------------------------
       07. ACTIVE SECTION TRACKING
       Highlight the navigation link associated with the section
       currently entering the viewport.
       -------------------------------------------------------- */

    const sectionLinks = Array.from(
        navigationLinks.querySelectorAll('a[href^="#"]')
    );

    const trackedSections = sectionLinks
        .map((link) => {
            const targetId = link.getAttribute("href");
            const target = document.querySelector(targetId);

            return target ? { link, target } : null;
        })
        .filter(Boolean);

    function setActiveSection(activeId) {
        sectionLinks.forEach((link) => {
            const isActive =
                link.getAttribute("href") === `#${activeId}`;

            link.classList.toggle("is-active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries.filter(
                    (entry) => entry.isIntersecting
                );

                if (visibleEntries.length === 0) {
                    return;
                }

                // Choose the visible section nearest the top.
                visibleEntries.sort(
                    (a, b) =>
                        a.boundingClientRect.top -
                        b.boundingClientRect.top
                );

                setActiveSection(visibleEntries[0].target.id);
            },
            {
                rootMargin: "-20% 0px -65% 0px",
                threshold: 0
            }
        );

        trackedSections.forEach(({ target }) => {
            sectionObserver.observe(target);
        });
    }


    /* --------------------------------------------------------
       08. MOTION PREFERENCE
       Keep interaction usable without unnecessary animation.
       CSS provides the corresponding transition overrides.
       -------------------------------------------------------- */

    if (reducedMotion) {
        document.documentElement.style.scrollBehavior = "auto";
    }

    // Ensure the menu starts in a predictable closed state.
    setMenuOpen(false);

    console.info(
        "SILK WEAVER | Navigation interactions initialised."
    );
}


function initialiseHeroMotion() {
    const hero = document.querySelector(".hero");
    const heroImage = document.querySelector(".hero__image");

    if (!hero || !heroImage) {
        console.warn("Silk Weaver: hero elements were not found.");
        return;
    }

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    // Retain the styled background if the remote image is unavailable.
    function handleImageFailure() {
        hero.classList.add("hero--image-fallback");
        heroImage.classList.add("hero__image--failed");
    }

    heroImage.addEventListener("error", handleImageFailure);

    // Handle an image that failed before this listener was attached.
    if (heroImage.complete && heroImage.naturalWidth === 0) {
        handleImageFailure();
    }

    /*
     * A small scroll-based offset adds depth to the image.
     * requestAnimationFrame prevents excessive style updates.
     */
    let animationFrame = null;

    function updateHeroParallax() {
        animationFrame = null;

        if (reducedMotion.matches) {
            hero.style.removeProperty("--hero-parallax-y");
            return;
        }

        const bounds = hero.getBoundingClientRect();

        // Stop calculating when the hero is well outside the viewport.
        if (bounds.bottom < 0 || bounds.top > window.innerHeight) {
            return;
        }

        const movement = Math.max(-18, Math.min(18, -bounds.top * 0.035));

        hero.style.setProperty(
            "--hero-parallax-y",
            `${movement}px`
        );
    }

    function requestParallaxUpdate() {
        if (animationFrame !== null) return;

        animationFrame = window.requestAnimationFrame(
            updateHeroParallax
        );
    }

    window.addEventListener("scroll", requestParallaxUpdate, {
        passive: true
    });

    window.addEventListener("resize", requestParallaxUpdate, {
        passive: true
    });

    // Reapply the correct behaviour if the user changes motion settings.
    reducedMotion.addEventListener?.("change", requestParallaxUpdate);

    updateHeroParallax();

    console.info("SILK WEAVER | Hero motion initialised.");
}

function initialiseScrollReveals() {
    const revealElements = document.querySelectorAll(".reveal-on-scroll");

    if (revealElements.length === 0) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // Keep all content visible if animations are unnecessary or unsupported.
    if (
        reducedMotion ||
        !("IntersectionObserver" in window)
    ) {
        revealElements.forEach((element) => {
            element.classList.add("is-revealed");
        });
        return;
    }

    const motionSettings = window.getComputedStyle(document.documentElement);
    const staggerStep =
        Number.parseFloat(
            motionSettings.getPropertyValue("--motion-stagger-step")
        ) || 110;
    const staggerMax =
        Number.parseFloat(
            motionSettings.getPropertyValue("--motion-stagger-max")
        ) || 330;

    document.querySelectorAll("[data-stagger]").forEach((group) => {
        const revealChildren = Array.from(group.children).filter((child) =>
            child.matches(".reveal-on-scroll")
        );

        revealChildren.forEach((element, index) => {
            const delay = Math.min(index * staggerStep, staggerMax);
            element.style.setProperty("--reveal-delay", `${delay}ms`);
        });
    });

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-revealed");

                // Reveal each item once to avoid repetitive animation.
                observer.unobserve(entry.target);
            });
        },
        {
            root: null,
            rootMargin: "0px 0px -8% 0px",
            threshold: 0.12
        }
    );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });

    document.documentElement.classList.add("js-motion");

    console.info("SILK WEAVER | Scroll reveal interactions initialised.");
}

function initialiseStoryMotion() {
    const story = document.querySelector(".story-section");
    const image = document.querySelector(".story-visual__image");

    if (!story || !image) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    if (reducedMotion.matches) return;

    let frameRequested = false;

    function updateStoryImage() {
        frameRequested = false;

        const rect = story.getBoundingClientRect();

        // Avoid work when the story section is off-screen.
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;

        const progress =
            (window.innerHeight - rect.top) /
            (window.innerHeight + rect.height);

        // Keep the effect subtle to preserve the editorial feel.
        const offset = (progress - 0.5) * 18;

        image.style.setProperty(
            "--story-image-offset",
            `${offset.toFixed(2)}px`
        );
    }

    function requestUpdate() {
        if (frameRequested) return;

        frameRequested = true;
        window.requestAnimationFrame(updateStoryImage);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    updateStoryImage();

    console.info("SILK WEAVER | Story motion initialised.");
}


function initialiseCraftTimeline() {
    const section = document.querySelector(".craft-section");
    const timeline = document.querySelector(".craft-timeline");
    const progressBar = document.querySelector("#craft-progress");
    const steps = Array.from(
        document.querySelectorAll("[data-craft-step]")
    );

    if (!section || !timeline || !progressBar || steps.length === 0) {
        return;
    }

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let frameRequested = false;

    function updateTimeline() {
        frameRequested = false;

        const sectionBounds = section.getBoundingClientRect();
        const timelineBounds = timeline.getBoundingClientRect();

        // Update progress only while the section is in view.
        if (
            sectionBounds.bottom >= 0 &&
            sectionBounds.top <= window.innerHeight
        ) {
            const viewportCentre = window.innerHeight * 0.5;

            const distanceTravelled = Math.max(
                0,
                Math.min(
                    timelineBounds.height,
                    viewportCentre - timelineBounds.top
                )
            );

            const progress = timelineBounds.height > 0
                ? (distanceTravelled / timelineBounds.height) * 100
                : 0;

            progressBar.style.height = `${progress}%`;
        }

        // Identify the stage nearest the viewport's centre.
        const viewportCentre = window.innerHeight * 0.5;
        let nearestStep = null;
        let nearestDistance = Infinity;

        steps.forEach((step) => {
            const bounds = step.getBoundingClientRect();
            const stepCentre = bounds.top + bounds.height * 0.5;
            const distance = Math.abs(stepCentre - viewportCentre);

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestStep = step;
            }
        });

        steps.forEach((step) => {
            const isCurrent = step === nearestStep;
            step.classList.toggle("is-current", isCurrent);
        });
    }

    function requestTimelineUpdate() {
        if (frameRequested) return;

        frameRequested = true;
        window.requestAnimationFrame(updateTimeline);
    }

    window.addEventListener("scroll", requestTimelineUpdate, {
        passive: true
    });

    window.addEventListener("resize", requestTimelineUpdate, {
        passive: true
    });

    // The progress rail is decorative; avoid motion when requested.
    if (reducedMotion.matches) {
        progressBar.style.height = "0%";
    }

    updateTimeline();

    console.info("SILK WEAVER | Craft timeline initialised.");
}



function initialiseSilkJournal() {
    const form = document.querySelector("#silk-journal-form");
    const emailInput = document.querySelector("#silk-journal-email");
    const status = document.querySelector("#silk-journal-status");

    // Exit safely if this section is not present on the page.
    if (!form || !emailInput || !status) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();

        // Clear previous feedback before validating again.
        status.textContent = "";
        status.classList.remove("is-error", "is-success");

        // Use the browser's native email validity checks.
        if (!email || !emailInput.validity.valid) {
            status.textContent = "Please enter a valid email address.";
            status.classList.add("is-error");
            emailInput.setAttribute("aria-invalid", "true");
            emailInput.focus();
            return;
        }

        emailInput.setAttribute("aria-invalid", "false");

        /*
         * Front-end demonstration only:
         * No email is stored or sent to a mailing list.
         * Connect your company's approved newsletter provider
         * or backend here before enabling real subscriptions.
         */
        status.textContent =
            "Your email is valid. Newsletter signup is not connected yet.";

        status.classList.add("is-success");
    });

    // Clear the invalid state when the visitor edits the address.
    emailInput.addEventListener("input", () => {
        emailInput.setAttribute("aria-invalid", "false");
        status.textContent = "";
        status.classList.remove("is-error", "is-success");
    });
}



function initialiseFeaturedSilk() {
    const section = document.querySelector("#featured-silk");

    if (!section) return;

    const track = section.querySelector("#featured-silk-track");
    const previousButton = section.querySelector("#featured-silk-prev");
    const nextButton = section.querySelector("#featured-silk-next");
    const progressBar = section.querySelector("#featured-silk-progress");

    if (!track || !previousButton || !nextButton || !progressBar) {
        return;
    }

    let animationFrame = null;

    // Keep the progress indicator in sync with the gallery position.
    function updateGalleryProgress() {
        if (animationFrame !== null) return;

        animationFrame = window.requestAnimationFrame(() => {
            const maxScroll = track.scrollWidth - track.clientWidth;
            const progress = maxScroll > 0
                ? track.scrollLeft / maxScroll
                : 1;

            progressBar.style.transform = `scaleX(${progress})`;

            // Disable controls at the beginning and end of the gallery.
            previousButton.disabled = track.scrollLeft <= 1;
            nextButton.disabled =
                track.scrollLeft >= maxScroll - 1 || maxScroll <= 0;

            previousButton.setAttribute(
                "aria-disabled",
                String(previousButton.disabled)
            );

            nextButton.setAttribute(
                "aria-disabled",
                String(nextButton.disabled)
            );

            animationFrame = null;
        });
    }

    // Scroll approximately one card at a time.
    function scrollGallery(direction) {
        const firstTile = track.querySelector(".featured-silk__tile");
        if (!firstTile) return;

        const trackStyles = window.getComputedStyle(track);
        const gap = parseFloat(trackStyles.columnGap) || 0;
        const distance = firstTile.getBoundingClientRect().width + gap;

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        track.scrollBy({
            left: direction * distance,
            behavior: prefersReducedMotion ? "auto" : "smooth"
        });
    }

    previousButton.addEventListener("click", () => {
        scrollGallery(-1);
    });

    nextButton.addEventListener("click", () => {
        scrollGallery(1);
    });

    track.addEventListener("scroll", updateGalleryProgress, {
        passive: true
    });

    window.addEventListener("resize", updateGalleryProgress, {
        passive: true
    });

    // Initialise the indicator and button states.
    updateGalleryProgress();
}