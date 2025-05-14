export const convertDistanceToMembershipValue = (inputValue) => {
    console.log("Input value:", inputValue);
    const umbralValue = 5;
    const maxValue = 10;

    if (inputValue <= umbralValue) {
        return 9;
    } else if (inputValue >= maxValue) {
        return 1;
    } else {
        // Scale the value between 1 and 9
        const scaledValue = ((inputValue - umbralValue) / (maxValue - umbralValue)) * 8 + 1;
        return Math.round(scaledValue);
    }
}

export default convertDistanceToMembershipValue;