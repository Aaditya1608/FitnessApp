const ACTIVITY_MULTIPLIERS = {
    sedentary:1.2,
    lightly_active:1.375,
    moderately_active: 1.55,
    highly_active: 1.725,
    extra_active: 1.9
}

export const calculateTargetCalories = ({weight,height,age,sex,lifestyle,goal}) =>{
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);

    let bmr = 10*w + 6.25*h - 5*a;
    if(sex.toLowerCase() === 'female'){
        bmr-=161;
    } else{
        bmr+=5;
    }

    const multiplier = ACTIVITY_MULTIPLIERS[lifestyle.toLowerCase()] || 1.2;
    const tdee = bmr * multiplier;

    let targetCal = tdee;

    if (goal === 'weight_loss'){
        targetCal = tdee - 500;

        const minCal = (sex.toLowerCase() === 'female')? 1200: 1500;
        if(targetCal<minCal){
            targetCal = minCal;
        }
    } else{
        targetCal = tdee + 500;
    }
    return Math.round(targetCal);
}