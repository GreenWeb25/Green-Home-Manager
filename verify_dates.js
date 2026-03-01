
function testDateParsing() {
    const dates = ["2026-02-09", "2026-02-15", "2026-02-16"];
    const expectedDays = [1, 0, 1]; // Mon, Sun, Mon

    console.log("Testing Date Parsing Consistency...");

    dates.forEach((dateStr, index) => {
        const d = new Date(dateStr);
        const dayLocal = d.getDay();
        const dayUTC = d.getUTCDay();

        console.log(`\nDate: ${dateStr}`);
        console.log(`Local getDay(): ${dayLocal} (${dayLocal === 0 ? "SUN" : "NOT SUN"})`);
        console.log(`UTC getUTCDay(): ${dayUTC} (${dayUTC === 0 ? "SUN" : "NOT SUN"})`);

        if (dayUTC !== expectedDays[index]) {
            console.error(`FAIL: Expected UTC day ${expectedDays[index]}, got ${dayUTC}`);
        } else {
            console.log("PASS: UTC day matches expectation.");
        }
    });

    console.log("\nSimulating formatting...");
    const dateStr = "2026-02-16"; // Monday
    const d = new Date(dateStr);
    const fmtLocal = d.toLocaleDateString('it-IT');
    const fmtUTC = d.toLocaleDateString('it-IT', { timeZone: 'UTC' });

    console.log(`Formatting ${dateStr}:`);
    console.log(`Local: ${fmtLocal}`);
    console.log(`UTC: ${fmtUTC}`);
}

testDateParsing();
