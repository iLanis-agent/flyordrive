/* FlyOrDrive engine - trip-level fly vs drive comparison. */
const FlyDriveEngine = (() => {
  'use strict';

  const GAS_CO2_PER_L = 2.31;   // kg CO2 per liter of gasoline
  const FLY_CO2_PER_KM = 0.115; // kg CO2 per passenger-km, economy average
  const CRUISE_KMH = 700;       // assumed average flight speed incl. climb/descent

  function norm(opts) {
    const num = (v, label, lo, hi) => {
      const n = Number(v);
      if (!Number.isFinite(n) || n < lo || n > hi) throw new Error(label + ' must be ' + lo + '-' + hi);
      return n;
    };
    return {
      distanceKm: num(opts.distanceKm, 'distance', 50, 20000),
      passengers: Math.round(num(opts.passengers, 'passengers', 1, 9)),
      avgSpeedKmh: num(opts.avgSpeedKmh, 'average speed', 30, 130),
      l100: num(opts.l100, 'consumption', 2, 30),
      fuelPrice: num(opts.fuelPrice, 'fuel price', 0.1, 20),
      driveHoursPerDay: num(opts.driveHoursPerDay, 'driving hours per day', 4, 16),
      hotelPerNight: num(opts.hotelPerNight, 'hotel per night', 0, 2000),
      ticketPrice: num(opts.ticketPrice, 'ticket price', 0, 50000),
      bagsFees: num(opts.bagsFees, 'bag fees', 0, 5000),
      transfersCost: num(opts.transfersCost, 'transfers cost', 0, 5000),
      airportHours: num(opts.airportHours, 'airport hours', 0.5, 8),
      transferHours: num(opts.transferHours, 'transfer hours', 0, 6)
    };
  }

  function drivePlan(o) {
    const driveHours = o.distanceKm / o.avgSpeedKmh;
    const days = Math.ceil(driveHours / o.driveHoursPerDay);
    const nights = days - 1;
    const fuelL = o.distanceKm / 100 * o.l100;
    const cost = fuelL * o.fuelPrice + nights * o.hotelPerNight;
    return {
      hours: driveHours,
      days: days,
      nights: nights,
      fuelLiters: fuelL,
      costTotal: cost,
      costPerPerson: cost / o.passengers,
      co2Kg: fuelL * GAS_CO2_PER_L,
      co2PerPerson: fuelL * GAS_CO2_PER_L / o.passengers
    };
  }

  function flyPlan(o) {
    const flightHours = o.distanceKm / CRUISE_KMH + 0.5;
    const hours = flightHours + 2 * o.airportHours + 2 * o.transferHours;
    const cost = (o.ticketPrice + o.bagsFees) * o.passengers + 2 * o.transfersCost;
    return {
      hours: hours,
      flightHours: flightHours,
      costTotal: cost,
      costPerPerson: cost / o.passengers,
      co2Kg: o.distanceKm * FLY_CO2_PER_KM * o.passengers,
      co2PerPerson: o.distanceKm * FLY_CO2_PER_KM
    };
  }

  function compare(rawOpts) {
    const o = norm(rawOpts);
    const drive = drivePlan(o);
    const fly = flyPlan(o);
    const cheaper = drive.costTotal <= fly.costTotal ? 'drive' : 'fly';
    const faster = drive.hours <= fly.hours ? 'drive' : 'fly';
    const costDiff = Math.abs(drive.costTotal - fly.costTotal);
    const timeDiffH = Math.abs(drive.hours - fly.hours);
    // Cost per hour saved: only meaningful when the faster option costs more
    let costPerHourSaved = null;
    if (cheaper !== faster && timeDiffH > 0.01) costPerHourSaved = costDiff / timeDiffH;
    const greener = drive.co2Kg <= fly.co2Kg ? 'drive' : 'fly';
    return { drive: drive, fly: fly, cheaper: cheaper, faster: faster, greener: greener,
      costDiff: costDiff, timeDiffHours: timeDiffH, costPerHourSaved: costPerHourSaved };
  }

  return { GAS_CO2_PER_L, FLY_CO2_PER_KM, CRUISE_KMH, norm, drivePlan, flyPlan, compare };
})();
if (typeof module !== 'undefined') module.exports = FlyDriveEngine;
