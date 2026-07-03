(() => {
  // ============================================================
  //  CONFIG  —  change your shortcut here, then reload the
  //  extension (chrome://extensions -> the reload arrow).
  //  Set a modifier to true/false and pick the letter.
  //  Default below = Alt + A
  // ============================================================
  const SHORTCUT = { ctrl: false, alt: true, shift: false, meta: false, key: "a" };
  // ============================================================

  const log = (...a) => console.log("[Commbox Quick Copy]", ...a);

  function matchesShortcut(e) {
    return (
      !!e.altKey   === !!SHORTCUT.alt &&
      !!e.ctrlKey  === !!SHORTCUT.ctrl &&
      !!e.shiftKey === !!SHORTCUT.shift &&
      !!e.metaKey  === !!SHORTCUT.meta &&
      (e.key || "").toLowerCase() === SHORTCUT.key.toLowerCase()
    );
  }

  // --- low level event helpers ---------------------------------
  function fire(el, types) {
    types.forEach((type) => {
      const Ctor = type.startsWith("pointer") ? PointerEvent : MouseEvent;
      el.dispatchEvent(new Ctor(type, { bubbles: true, cancelable: true, view: window }));
    });
  }
  const hover = (el) => fire(el, ["pointerover", "pointerenter", "mouseover", "mouseenter", "mousemove"]);
  const click = (el) => {
    try { el.focus({ preventScroll: true }); } catch (_) {}
    fire(el, ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]);
  };

  function waitFor(fn, { timeout = 2500, interval = 30 } = {}) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      (function tick() {
        let res;
        try { res = fn(); } catch (_) {}
        if (res) return resolve(res);
        if (Date.now() - start > timeout) return reject(new Error("timeout waiting for element"));
        setTimeout(tick, interval);
      })();
    });
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // --- the actual flow -----------------------------------------
  async function copyConversation() {
    // 1) the three-dots button on the open conversation
    const dots =
      document.querySelector('#divExpandedObjectsWrapper span.userTopObjectActions.icon-dots-three-vertical') ||
      document.querySelector('#divExpandedObjectsWrapper span.userTopObjectActions') ||
      document.querySelector('span.userTopObjectActions.icon-dots-three-vertical');
    if (!dots) throw new Error("three-dots button not found");
    click(dots);

    // 2) wait for the menu, hover "Conversation Summary" to reveal its submenu
    const summary = await waitFor(() => {
      const items = [...document.querySelectorAll(
        'ul.controlOpen li.hasSubMenu, ul.theme_menu li.hasSubMenu'
      )];
      return items.find((li) => /conversation summary/i.test(li.textContent)) || items[0] || null;
    });
    hover(summary);

    // 3) find the clipboard item (prefer the one inside the open menu) and click it
    const clip = await waitFor(() => {
      const open = document.querySelector('ul.controlOpen');
      return (open && open.querySelector('li[class*="hrefGetObjectToClipBoard"]')) ||
             document.querySelector('li[class*="hrefGetObjectToClipBoard"]');
    });
    await sleep(40); // let the submenu settle
    click(clip);

    toast("Conversation copied \u2713");

    // 4) close the menu
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    document.body && click(document.body);
  }

  // --- key listener (capture phase so Commbox can't swallow it) -
  window.addEventListener(
    "keydown",
    (e) => {
      if (!matchesShortcut(e)) return;
      e.preventDefault();
      e.stopPropagation();
      copyConversation().catch((err) => {
        console.error("[Commbox Quick Copy] failed:", err);
        toast("Copy failed \u2013 see console", true);
      });
    },
    true
  );

  // --- tiny toast ----------------------------------------------
  let toastEl;
  function toast(msg, isError) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.style.cssText =
        "position:fixed;z-index:2147483647;bottom:24px;left:50%;transform:translateX(-50%);" +
        "padding:10px 16px;border-radius:8px;font:600 13px Arial,sans-serif;color:#fff;" +
        "box-shadow:0 6px 24px rgba(0,0,0,.25);opacity:0;transition:opacity .15s;pointer-events:none";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.background = isError ? "#c0392b" : "linear-gradient(135deg,#00d2ff,#3a7bd5)";
    toastEl.style.opacity = "1";
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => { toastEl.style.opacity = "0"; }, 1400);
  }

  log("loaded. Shortcut:", SHORTCUT);
})();
