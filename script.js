(() => {
    'use strict';

    // ─── DOM refs ───
    const form        = document.getElementById('bmi-form');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const heightUnit  = document.getElementById('height-unit');
    const weightUnit  = document.getElementById('weight-unit');
    const resultCard  = document.getElementById('result-card');
    const bmiValue    = document.getElementById('bmi-value');
    const ringProgress= document.getElementById('ring-progress');
    const categoryBadge = document.getElementById('category-badge');
    const categoryDot = document.getElementById('category-dot');
    const categoryText= document.getElementById('category-text');
    const resultDesc  = document.getElementById('result-description');
    const scaleMarker = document.getElementById('scale-marker');
    const unitBtns    = document.querySelectorAll('.unit-btn');
    const unitToggle  = document.querySelector('.unit-toggle');

    let currentUnit = 'metric';

    // ─── Unit toggle ───
    unitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const unit = btn.dataset.unit;
            if (unit === currentUnit) return;

            currentUnit = unit;
            unitBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            unitToggle.dataset.active = unit;

            if (unit === 'imperial') {
                heightUnit.textContent = 'in';
                weightUnit.textContent = 'lbs';
                heightInput.placeholder = '67';
                weightInput.placeholder = '143';
            } else {
                heightUnit.textContent = 'cm';
                weightUnit.textContent = 'kg';
                heightInput.placeholder = '170';
                weightInput.placeholder = '65';
            }

            // Convert existing values
            const h = parseFloat(heightInput.value);
            const w = parseFloat(weightInput.value);
            if (!isNaN(h) && h > 0) {
                heightInput.value = unit === 'imperial'
                    ? (h / 2.54).toFixed(1)
                    : (h * 2.54).toFixed(1);
            }
            if (!isNaN(w) && w > 0) {
                weightInput.value = unit === 'imperial'
                    ? (w * 2.20462).toFixed(1)
                    : (w / 2.20462).toFixed(1);
            }
        });
    });

    // ─── BMI calculation ───
    function calculateBMI(height, weight, unit) {
        let heightM, weightKg;
        if (unit === 'metric') {
            heightM  = height / 100;
            weightKg = weight;
        } else {
            heightM  = height * 0.0254;
            weightKg = weight * 0.453592;
        }
        return weightKg / (heightM * heightM);
    }

    function getCategory(bmi) {
        if (bmi < 18.5) return {
            key: 'underweight',
            label: 'Underweight',
            description: 'Your BMI suggests you may be underweight. Consider consulting a healthcare provider about nutrition and healthy weight strategies.'
        };
        if (bmi < 25) return {
            key: 'normal',
            label: 'Normal Weight',
            description: 'Your BMI is within the healthy range. Maintain your wellbeing with balanced nutrition and regular activity.'
        };
        if (bmi < 30) return {
            key: 'overweight',
            label: 'Overweight',
            description: 'Your BMI suggests you may be overweight. Small lifestyle adjustments in diet and exercise can make a meaningful difference.'
        };
        return {
            key: 'obese',
            label: 'Obese',
            description: 'Your BMI falls in the obese range. Speaking with a healthcare provider can help you explore personalized options.'
        };
    }

    // ─── Ring animation ───
    const CIRCUMFERENCE = 2 * Math.PI * 70; // ~439.82

    function setRingProgress(bmi) {
        // Map BMI 10–40 to 0–100%
        const pct = Math.min(Math.max((bmi - 10) / 30, 0), 1);
        const offset = CIRCUMFERENCE * (1 - pct);
        ringProgress.style.strokeDashoffset = offset;
    }

    // ─── Scale marker position ───
    function setScalePosition(bmi) {
        // Map BMI to percentage along the scale (range 15–40)
        const pct = Math.min(Math.max((bmi - 15) / 25 * 100, 2), 98);
        scaleMarker.style.left = pct + '%';
    }

    // ─── Animated counter ───
    function animateValue(target, duration) {
        const start = parseFloat(bmiValue.textContent) || 0;
        const startTime = performance.now();

        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease out expo
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (target - start) * eased;
            bmiValue.textContent = current.toFixed(1);
            if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }

    // ─── Form submit ───
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const h = parseFloat(heightInput.value);
        const w = parseFloat(weightInput.value);

        if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) return;

        const bmi = calculateBMI(h, w, currentUnit);
        const cat = getCategory(bmi);

        // Show result
        resultCard.classList.add('visible');
        resultCard.dataset.category = cat.key;

        // Animate
        animateValue(bmi, 800);
        setRingProgress(bmi);
        setScalePosition(bmi);

        categoryText.textContent = cat.label;
        resultDesc.textContent = cat.description;
    });
})();
