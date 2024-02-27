const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();

app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define route to retrieve software information
app.get('/api/software', (req, res) => {
    // PowerShell commands
    const powershellCommand1 = 'powershell "Get-WmiObject -Class Win32_Product | Select-Object Name, Version, Vendor"';
    const powershellCommand2 = 'powershell "Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName, DisplayVersion, Publisher, InstallDate"';

    // Function to execute PowerShell command
    function executePowerShellCommand(command, callback) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing PowerShell command: ${error}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }

            callback(stdout);
        });
    }

    // Function to parse and merge results from PowerShell commands
    function parseAndMergeResults(stdout1, stdout2) {
        const softwareList = [];

        // Parse output of the first PowerShell command
        const software1 = stdout1.trim().split('\n').slice(2).map(line => {
            const [name, version, vendor] = line.trim().split(/\s{2,}/);
            return { name, version, vendor };
        });

        // Parse output of the second PowerShell command
        const software2 = stdout2.trim().split('\n').slice(2).map(line => {
            const properties = line.trim().split(/\s{2,}/);
            const displayName = properties[0];
            const displayVersion = properties[1];
            const publisher = properties[2];
            const installDate = properties[3];
            return { name: displayName, version: displayVersion, vendor: publisher, installDate };
        });

        // Merge results
        softwareList.push(...software1, ...software2);

        return softwareList;
    }

    // Execute both PowerShell commands and merge results
    executePowerShellCommand(powershellCommand1, (stdout1) => {
        executePowerShellCommand(powershellCommand2, (stdout2) => {
            const softwareList = parseAndMergeResults(stdout1, stdout2);
            res.json(softwareList);
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
