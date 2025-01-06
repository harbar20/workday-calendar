// Generate or retrieve installation ID
function getUserId() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["user_id"], (result) => {
            if (result.user_id) {
                resolve(result.user_id);
            } else {
                // Generate a new random ID if none exists
                const newId = crypto.randomUUID();
                chrome.storage.local.set({ user_id: newId }, () => {
                    resolve(newId);
                });
            }
        });
    });
}

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
    if (!request.courses) return;

    const user_id = await getUserId();

    const data = request.courses;

    data = data.map((course) => {
        // Parse meeting pattern
        const [days, times, location] = course.meeting_pattern.split(" | ");
        const daysArray = days
            .split("-")
            .filter((day) => day)
            .map((day) => dayMapping[day] || day);

        // Add parsed data to the data object
        course.parsed_schedule = {
            days: daysArray,
            startTime: times.split(" - ")[0],
            endTime: times.split(" - ")[1],
            location: location,
        };

        return course;
    });

    fetch(`https://workday-calendar.harbar2021.workers.dev/${user_id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
});
