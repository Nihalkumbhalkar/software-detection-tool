// Define function to fetch software information from the server
function fetchSoftwareInformation() {
    fetch('/api/software')
        .then(response => response.json())
        .then(data => {
            const softwareList = document.getElementById('software-list');
            data.forEach((software, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${index + 1}. ${software.name} (${software.version}) - ${software.vendor} - Installed on: ${software.installDate}`;
                softwareList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching software information:', error));
}

// Call the function to fetch software information when the page loads
document.addEventListener('DOMContentLoaded', fetchSoftwareInformation);
