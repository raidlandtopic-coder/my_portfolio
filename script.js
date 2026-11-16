/* ==========================================================
   Rishabh Negi - Portfolio scripts
   1. Theme toggle (remembers the choice)
   2. Mobile menu
   3. Delhi clock and flying plane on the home page
   4. Copy-email button
   5. Contact form: opens your email app with the message filled in
   ========================================================== */

(function () {
    "use strict";

    var OWNER_EMAIL = "raidlandtopic@gmail.com";

    /* ---------- Safe storage (can throw in private windows) ---------- */
    function readSetting(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function saveSetting(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }

    /* ---------- 1. Theme toggle ---------- */
    var root = document.documentElement;
    var themeBtn = document.getElementById("theme-toggle");

    function systemPrefersDark() {
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    function currentTheme() {
        return root.getAttribute("data-theme") || (systemPrefersDark() ? "dark" : "light");
    }

    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);
        if (themeBtn) {
            themeBtn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
            themeBtn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
        }
    }

    var saved = readSetting("portfolio-theme");
    if (saved === "light" || saved === "dark") {
        applyTheme(saved);
    } else if (themeBtn) {
        applyTheme(currentTheme());
        root.removeAttribute("data-theme"); /* keep following the system until the visitor chooses */
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", function () {
            var next = currentTheme() === "dark" ? "light" : "dark";
            applyTheme(next);
            saveSetting("portfolio-theme", next);
        });
    }

    /* ---------- 2. Mobile menu ---------- */
    var navToggle = document.getElementById("nav-toggle");
    var siteNav = document.getElementById("site-nav");

    function setMenu(open) {
        if (!navToggle || !siteNav) return;
        siteNav.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        navToggle.textContent = open ? "Close" : "Menu";
    }

    if (navToggle && siteNav) {
        navToggle.addEventListener("click", function () {
            setMenu(navToggle.getAttribute("aria-expanded") !== "true");
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") setMenu(false);
        });
        siteNav.addEventListener("click", function (e) {
            if (e.target.closest("a")) setMenu(false);
        });
    }

    /* ---------- 3. Delhi clock ---------- */
    var clock = document.getElementById("delhi-clock");

    function tickClock() {
        if (!clock) return;
        try {
            clock.textContent = new Intl.DateTimeFormat("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Kolkata"
            }).format(new Date()) + " IST";
        } catch (e) {
            clock.textContent = "";
        }
    }

    if (clock) {
        tickClock();
        setInterval(tickClock, 30000);
    }

    /* Plane on the home page route: skip the flight if the visitor prefers less motion */
    var flyer = document.getElementById("flyer");
    var routePath = document.getElementById("route-path");
    var flyerMotion = document.getElementById("flyer-motion");

    if (flyer && routePath && flyerMotion &&
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        try {
            var total = routePath.getTotalLength();
            var end = routePath.getPointAtLength(total);
            var before = routePath.getPointAtLength(total - 1);
            var angle = Math.atan2(end.y - before.y, end.x - before.x) * 180 / Math.PI;
            flyerMotion.parentNode.removeChild(flyerMotion);
            flyer.setAttribute("transform", "translate(" + end.x + " " + end.y + ") rotate(" + angle + ")");
        } catch (e) { /* leave the animation alone */ }
    }

    /* ---------- 4. Copy email ---------- */
    var copyBtn = document.getElementById("copy-email");

    if (copyBtn) {
        copyBtn.addEventListener("click", function () {
            var done = function () {
                copyBtn.textContent = "Copied";
                setTimeout(function () { copyBtn.textContent = "Copy"; }, 1800);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(OWNER_EMAIL).then(done, function () {
                    copyBtn.textContent = "Select and copy";
                });
            } else {
                copyBtn.textContent = "Select and copy";
            }
        });
    }

    /* ---------- 5. Contact form ---------- */
    var form = document.getElementById("contact-form");
    var status = document.getElementById("form-status");

    function setStatus(message, isError) {
        if (!status) return;
        status.textContent = message;
        status.classList.toggle("is-error", !!isError);
    }

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            if (!form.checkValidity()) {
                var firstBad = form.querySelector(":invalid");
                setStatus("Please fill in every field correctly.", true);
                if (firstBad) firstBad.focus();
                return;
            }

            var name = form.elements["name"].value.trim();
            var email = form.elements["email"].value.trim();
            var subject = form.elements["subject"].value.trim();
            var message = form.elements["message"].value.trim();

            var body = message + "\n\n" + "From: " + name + " (" + email + ")";
            var href = "mailto:" + OWNER_EMAIL +
                "?subject=" + encodeURIComponent(subject) +
                "&body=" + encodeURIComponent(body);

            setStatus("Opening your email app. Press send there to deliver the message.", false);
            window.location.href = href;
        });

        form.addEventListener("reset", function () {
            setStatus("", false);
        });

        form.addEventListener("input", function () {
            if (status && status.classList.contains("is-error")) setStatus("", false);
        });
    }
})();
