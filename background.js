const dayMapping = {
    M: "MO",
    T: "TU",
    W: "WE",
    R: "TH",
    F: "FR",
    S: "SA",
    U: "SU",
};

// Receive message from content.js
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (!request.courses || !request.user_id) return;

    const user_id = request.user_id;

    const data = request.courses.filter(
        (course) => course.section && course.meeting_pattern
    );

    const parsedData = data.map((course) => {
        // Parse meeting pattern
        const [days, times, location] = course.meeting_pattern.split(" | ");
        const daysArray = days
            .split("-")
            .filter((day) => day)
            .map((day) => dayMapping[day] || day);

        // Add parsed data to the data object
        course.parsed_schedule = {
            days: daysArray,
            start_time: times.split(" - ")[0],
            end_time: times.split(" - ")[1],
            location: location,
        };

        return course;
    });

    console.log(parsedData);
    await fetch(`https://workday-calendar.harbar2021.workers.dev/${user_id}`, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
    });
});
