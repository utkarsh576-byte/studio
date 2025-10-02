(function() {
  const birthDateEl = document.getElementById("birthDate");
  const birthTimeEl = document.getElementById("birthTime");
  const calcBtn = document.getElementById("calcBtn");
  const resetBtn = document.getElementById("resetBtn");
  const resultSec = document.getElementById("result");
  const ageYearsEl = document.getElementById("ageYears");
  const fullBreakdownEl = document.getElementById("fullBreakdown");
  const liveEl = document.getElementById("live");

  let liveTimer = null;
  let birthDateTime = null;
  let useTime = false;

  function clearLive() {
    if (liveTimer) {
      clearInterval(liveTimer);
      liveTimer = null;
    }
    liveEl.classList.add("hidden");
    liveEl.textContent = "";
  }

  function calcAgeYearsOnly(dateObj, now) {
    let years = now.getFullYear() - dateObj.getFullYear();
    const hasNotHadBirthdayThisYear =
      now.getMonth() < dateObj.getMonth() ||
      (now.getMonth() === dateObj.getMonth() && now.getDate() < dateObj.getDate());
    if (hasNotHadBirthdayThisYear) years--;
    return years;
  }

  function plural(n, word, lang = "mr") {
    // Simple Marathi plural logic fallback to English pattern
    if (lang === "mr") {
      // Keep it straightforward
      return `${n} ${word}`;
    }
    return n === 1 ? `${n} ${word}` : `${n} ${word}s`;
  }

  function formatBreakdown(ms) {
    // Total difference
    let remaining = ms / 1000;
    const seconds = Math.floor(remaining % 60);
    remaining = (remaining - seconds) / 60;
    const minutes = Math.floor(remaining % 60);
    remaining = (remaining - minutes) / 60;
    const hours = Math.floor(remaining % 24);
    remaining = (remaining - hours) / 24;
    const days = Math.floor(remaining);

    return { days, hours, minutes, seconds };
  }

  function calcFull(now) {
    if (!birthDateTime) return;
    const diffMs = now - birthDateTime;
    if (diffMs < 0) {
      ageYearsEl.innerHTML = `<span style="color: var(--danger)">जन्मतारीख / वेळ भविष्यातील आहे.</span>`;
      fullBreakdownEl.textContent = "";
      clearLive();
      return;
    }

    // Age in calendar years
    const years = calcAgeYearsOnly(birthDateTime, now);

    ageYearsEl.textContent = `वय: ${years} वर्षे`;

    if (useTime) {
      const breakdown = formatBreakdown(diffMs);
      // अतिरिक्त माहिती: अंदाजे एकूण दिवस, तास वगैरे
      const totalSeconds = Math.floor(diffMs / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalDays = Math.floor(totalHours / 24);

      fullBreakdownEl.innerHTML =
        `एकूण दिवस: ${totalDays.toLocaleString()} | एकूण तास: ${totalHours.toLocaleString()} | ` +
        `एकूण मिनिटे: ${totalMinutes.toLocaleString()} | एकूण सेकंद: ${totalSeconds.toLocaleString()}`;

      liveEl.classList.remove("hidden");

      const updateLive = () => {
        const nowLive = new Date();
        const dMs = nowLive - birthDateTime;
        if (dMs < 0) return;
        const b = formatBreakdown(dMs);
        // पुनश्च वर्षे live साठी (थोडा फरक नाही)
        const liveYears = calcAgeYearsOnly(birthDateTime, nowLive);

        liveEl.innerHTML =
          `LIVE Breakdown:
वर्षे: ${liveYears}
दिवस: ${b.days}
तास: ${b.hours}
मिनिटे: ${b.minutes}
सेकंद: ${b.seconds}`;
      };

      updateLive();
      clearLive();
      liveTimer = setInterval(updateLive, 1000);
    } else {
      fullBreakdownEl.textContent = `फक्त वर्षांचे वय दाखवले आहे (जन्माचा वेळ दिलेला नाही).`;
      clearLive();
    }

    resultSec.classList.remove("hidden");
  }

  calcBtn.addEventListener("click", () => {
    const dateVal = birthDateEl.value;
    const timeVal = birthTimeEl.value;

    if (!dateVal) {
      alert("कृपया जन्मतारीख भरा.");
      return;
    }

    // Construct birth datetime
    try {
      if (timeVal) {
        // date + time (assume local)
        birthDateTime = new Date(`${dateVal}T${timeVal}`);
        useTime = true;
      } else {
        birthDateTime = new Date(`${dateVal}T00:00:00`);
        useTime = false;
      }
    } catch (e) {
      alert("अवैध तारीख / वेळ.");
      return;
    }

    const now = new Date();
    calcFull(now);
  });

  resetBtn.addEventListener("click", () => {
    birthDateTime = null;
    useTime = false;
    clearLive();
    resultSec.classList.add("hidden");
  });
})();
