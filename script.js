(function() {
  const birthDateEl = document.getElementById("birthDate");
  const birthTimeEl = document.getElementById("birthTime");
  const calcBtn = document.getElementById("calcBtn");
  const resetBtn = document.getElementById("resetBtn");
  const resultSec = document.getElementById("result");
  const ageYearsEl = document.getElementById("ageYears");
  const fullBreakdownEl = document.getElementById("fullBreakdown");
  const liveEl = document.getElementById("live");
  const ageYmdEl = document.getElementById("ageYMD");
  const ageYmdInclEl = document.getElementById("ageYMDInclusive");

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

  // Years-Months-Days (standard calendar borrowing)
  function calcYMD(bDate, nDate) {
    const b = new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate());
    const n = new Date(nDate.getFullYear(), nDate.getMonth(), nDate.getDate());
    if (n < b) return { years: 0, months: 0, days: 0, future: true, borrowed: false };

    let years = n.getFullYear() - b.getFullYear();
    let months = n.getMonth() - b.getMonth();
    let days = n.getDate() - b.getDate();

    const borrowed = days < 0;
    if (days < 0) {
      const prevMonth = new Date(n.getFullYear(), n.getMonth(), 0);
      days += prevMonth.getDate();
      months -= 1;
    }
    if (months < 0) {
      months += 12;
      years -= 1;
    }
    return { years, months, days, future: false, borrowed };
  }

  // Inclusive variant (जर borrowing झाले तर दिवस +1)
  function toInclusive(ymdObj) {
    if (ymdObj.borrowed) {
      return {
        years: ymdObj.years,
        months: ymdObj.months,
        days: ymdObj.days + 1
      };
    }
    return { years: ymdObj.years, months: ymdObj.months, days: ymdObj.days };
  }

  function formatBreakdown(ms) {
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
      if (ageYmdEl) ageYmdEl.textContent = "";
      if (ageYmdInclEl) ageYmdInclEl.textContent = "";
      return;
    }

    const years = calcAgeYearsOnly(birthDateTime, now);
    ageYearsEl.textContent = `वय (पूर्ण वर्षे): ${years} वर्षे`;

    // Years-Months-Days
    const ymd = calcYMD(birthDateTime, now);
    if (ymd.future) {
      ageYmdEl.textContent = "भविष्यातील तारीख.";
      ageYmdInclEl.textContent = "";
    } else {
      ageYmdEl.textContent = `अचूक वय: ${ymd.years} वर्षे ${ymd.months} महिने ${ymd.days} दिवस`;
      const incl = toInclusive(ymd);
      if (incl.days !== ymd.days) {
        ageYmdInclEl.textContent =
          `Inclusive शैली: ${incl.years} वर्षे ${incl.months} महिने ${incl.days} दिवस`;
      } else {
        ageYmdInclEl.textContent = "";
      }
    }

    if (useTime) {
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
      fullBreakdownEl.textContent = `फक्त तारीख वापरली आहे (वेळ दिलेली नाही).`;
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
    try {
      if (timeVal) {
        birthDateTime = new Date(`${dateVal}T${timeVal}`);
        useTime = true;
      } else {
        birthDateTime = new Date(`${dateVal}T00:00:00`);
        useTime = false;
      }
    } catch {
      alert("अवैध तारीख / वेळ.");
      return;
    }
    calcFull(new Date());
  });

  resetBtn.addEventListener("click", () => {
    birthDateTime = null;
    useTime = false;
    clearLive();
    if (ageYmdEl) ageYmdEl.textContent = "";
    if (ageYmdInclEl) ageYmdInclEl.textContent = "";
    resultSec.classList.add("hidden");
  });
})();
