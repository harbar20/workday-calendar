// Generate or retrieve installation ID
function getUserId() {
    return new Promise((resolve, reject) => {
        if (!chrome.storage || !chrome.storage.local) {
            reject(new Error('Chrome storage API is not available'));
            return;
        }

        chrome.storage.local.get(["user_id"], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }

            if (result.user_id) {
                resolve(result.user_id);
            } else {
                // Generate a new random ID if none exists
                const newId = crypto.randomUUID();
                chrome.storage.local.set({ user_id: newId }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }
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

    const data = request.courses.filter((course) => course.section && course.meeting_pattern);

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

    fetch(`https://workday-calendar.harbar2021.workers.dev/${user_id}`, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
            // "Access-Control-Allow-Origin": "*",
            // "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
            // "Access-Control-Max-Age": "86400",
            // "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify(parsedData),
    });
});
