module.exports.calculateFare = (distance, duration) => {
    const baseFare = 50;
    const perKmRate = 12;
    const perMinuteRate = 2; // Adding time factor for realism

    // Distance in km
    const distanceInKm = distance / 1000;
    // Duration in minutes
    const durationInMinutes = duration / 60;

    const fare = baseFare + (distanceInKm * perKmRate) + (durationInMinutes * perMinuteRate);

    return Math.round(fare);
}
