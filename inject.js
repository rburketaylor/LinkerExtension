let currentIssue = "";

async function makeRequest(url) {
    let response = await fetch(url);
    if(response.ok){
        return await response.json();
    }
    else{
        console.log("Error in request");
        return;
    }
}

async function getTicketsByEmail(email) {
    const url = 'https://jira.gpei.ca/rest/api/2/search?jql=cf[10715]~"' + email + '"&fields=key';
    let tickets = [];
    const json = await makeRequest(url);
    const issues = json.issues;
    for (const issue of issues) {
        tickets.push(issue.key);
    }
    return tickets;
}

function checkForLink(ticket){
    let linkElements = $("dl[class='links-list ']").find("a").not("a[title='Delete this link']")
    let links = [];
    for(let i= 0; i < linkElements.length; i++){
        links.push(linkElements[i].innerHTML);
    }
    return links.indexOf(ticket) > -1;
}

async function sendNotification(email, peip) {
    currentIssue = peip;
    document.getElementById('opsbar-transitions_more').onclick = async function () {
        const tickets = await getTicketsByEmail(email);
        if (tickets.length <= 1) {
            console.log("no tickets");
            return;
        }
        console.log("tickets");
        let alerttext = "";
        for (let i = 0; i < tickets.length; i++) {
            if (tickets[i] != currentIssue && checkForLink(tickets[i]) == false) {
                alerttext += tickets[i] + " ";
            }
        }
        if(alerttext != ""){
            alerttext = alerttext.slice(0, -1);
            if(confirm(alerttext)){
                const cb = navigator.clipboard;
                cb.writeText(alerttext);
            }
        }
    }
}

(async () => {
    'use strict';
    const options = {
        fireOnAttributesModification: true,
        existing: true
    };

    $(document).arrive("#key-val", options, function() {
        let observer = new MutationObserver(function (mutations, me) {
            const emailElement = document.querySelector("a[title='Follow link']");
            const peipElement = document.getElementById("key-val"); 
            if(peipElement != null && emailElement != null){
                const email = emailElement.innerHTML;
                const peip = peipElement.innerHTML;
                sendNotification(email, peip);
                me.disconnect();
                return;
            }
        });

        observer.observe(document, {
            childList: true,
            subtree: true
        });
    });
})();