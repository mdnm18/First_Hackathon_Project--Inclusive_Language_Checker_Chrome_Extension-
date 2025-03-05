# First_Hackathon_Project--Inclusive_Language_Checker_Chrome_Extension-



```markdown
# 🌐 Inclusive Language Checker Chrome Extension 
Promote Gender-Neutral Communication with Real-Time AI-Powered Suggestions

## 🚀 Features
| Feature                      | Description                                                                 |
|------------------------------|-----------------------------------------------------------------------------|
| 🔄   Real-Time Processing    | Scans webpages/documents instantly for gendered terms                      |
| 🎯   Dual Modes              | Toggle between  Highlight  or  Auto-Replace  modes                         |
| 📊   Live Analytics          | Track daily/total inclusive changes via dashboard                          |
| ⚙️   Custom Dictionary       | Add/remove terms (e.g., "fireman" → "firefighter")                         |
| 🌈   Dark Mode               | Eye-friendly UI with smooth transitions                                    |

---

## 📦 Installation
```bash
# Clone the repository
git clone https://github.com/mdnm18/First_Hackathon_Project--Inclusive_Language_Checker_Chrome_Extension-

# Load in Chrome:
1. Navigate to chrome://extensions
2. Enable "Developer mode" (top-right)
3. Click "Load unpacked" and select the project folder
```

## 🛠️ Architecture Overview
### 📂 File Structure
```
📁 inclusive-language-checker/
├── 📄 manifest.json          → Extension configuration
├── 📄 popup.html             → User interface (HTML)
├── 📄 style.css              → Styling for UI
├── 📄 popup.js               → Core logic & settings
├── 📄 content.js             → Real-time webpage text processing
├── 📄 background.js          → Cross-script communication
└── 📁 images/                → Icons & diagrams
```

### 🔄 Workflow Diagram
```mermaid
graph TD
    A[User Browses Webpage] --> B[Content.js Scans Text]
    B --> C{Check Settings}
    C -->|Auto-Replace| D[Replace Gendered Terms]
    C -->|Highlight| E[Highlight Terms]
    D --> F[Update Statistics]
    E --> F
    F --> G[Display Modified Content]
```

## ⚙️ Technical Breakdown
### 🔗 File Interconnections
| File               | Role                                  | Key Dependencies         |
|--------------------|---------------------------------------|--------------------------|
| `manifest.json`    | Extension blueprint                  | All files                |
| `popup.html`       | UI for settings & stats              | `style.css`, `popup.js`  |
| `content.js`       | Real-time text processing            | `popup.js` (settings)    |
| `background.js`    | Handles cross-script messaging       | `popup.js`, `content.js` |

### 📡 Inter-File Communication
```mermaid
sequenceDiagram
    participant P as popup.js
    participant B as background.js
    participant C as content.js
    
    P->>B: Send settings update
    B->>C: Broadcast new config
    C->>B: Report replacements
    B->>P: Update statistics
```

## 🌟 Key Technical Features
1. **Dynamic Content Handling**  
   Uses `MutationObserver` to track webpage changes in real-time.

2. **Context-Aware Replacement**  
   Preserves capitalization (e.g., "Chairman" → "Chairperson").

3. **Persistent Storage**  
   ```javascript
   chrome.storage.local.set({ key: value });  // Save settings
   chrome.storage.local.get(['key'], callback);  // Retrieve data
   ```
4. **Real-Time Text Processing**  
```javascript
// content.js
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => processNewNodes(mutation.addedNodes));
});
observer.observe(document.body, { childList: true, subtree: true });
```

5. **Cross-File Communication**  
```javascript
// popup.js ↔ background.js
chrome.runtime.sendMessage({ action: "fetchData" }, (response) => {
  console.log("Background script response:", response.data);
});
```

6. **Custom Dictionary System**  
```javascript
// popup.js
state.customTerms = {
  "chairman": "chairperson",
  "policeman": "police officer"
};
chrome.storage.local.set({ customTerms: state.customTerms });
```

## 🤝 Contributing
We welcome contributions! Please follow our guidelines:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
Distributed under MIT License. See `LICENSE` for details.

---

Made with ❤️ by #TheCodeBreakers | [SRMIST](https://www.srmist.edu.in/)
```



classDiagram
    class Voter {
        - voterID : int
        - name : string
        - address : string
        - nationalID : string
        - hasVoted : boolean
        + register() : void
        + authenticate(nationalID: string) : boolean
        + castVote(candidate: Candidate) : void
        + getVoterID() : int
        + getName() : string
        + setHasVoted(hasVoted: boolean) : void
        + getHasVoted(): boolean
    }

    class Candidate {
        - candidateID : int
        - name : string
        - party : string
        - symbol : string
        - voteCount : int
        + getCandidateID() : int
        + getName() : string
        + getParty() : string
        + getSymbol() : string
        + incrementVoteCount() : void
        + getVoteCount() : int
    }

    class Election {
        - electionID : int
        - electionName : string
        - startDate : Date
        - endDate : Date
        - status : string
        + startElection() : void
        + endElection() : void
        + getElectionID() : int
        + getElectionName() : string
        + getStatus() : string
        + addCandidate(candidate: Candidate) : void
        + getCandidates() : List~Candidate~
        + getStartDate() : Date
        + getEndDate() : Date
        + setStatus(status: string) : void
    }

    class VotingSystem {
        - voters : List~Voter~
        - candidates : List~Candidate~
        - elections : List~Election~
        + registerVoter(voter: Voter) : void
        + authenticateVoter(nationalID: string) : Voter
        + addCandidate(candidate: Candidate) : void
        + startElection(election: Election) : void
        + endElection(election: Election) : void
        + castVote(voterID: int, candidateID: int) : boolean
        + getElectionResults(electionID: int) : Map~Candidate, int~
        + createElection(election: Election) : void
        + getElection(electionID: int) : Election
        + getVoter(voterID: int) : Voter
        + getCandidate(candidateID: int) : Candidate
    }

    class Administrator {
        - adminID : int
        - username : string
        - password : string
        + login(username: string, password: string) : boolean
        + manageElections(election: Election) : void
        + manageCandidates(candidate: Candidate) : void
        + manageVoters(voter: Voter) : void
    }

    VotingSystem "1" -- "*" Voter : manages
    VotingSystem "1" -- "*" Candidate : manages
    VotingSystem "1" -- "*" Election : manages
    Election "1" -- "*" Candidate : has
    Voter "1" -- "1" Election : votes in
    Administrator "1" -- "1" VotingSystem : manages

