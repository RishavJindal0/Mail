document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    document.querySelector("#compose-form").addEventListener('submit',send_mail);
    // By default, load the inbox
    load_mailbox('inbox');
  });

function send_mail(event)
{
    event.preventDefault();
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: document.querySelector('#compose-recipients').value,
            subject: document.querySelector('#compose-subject').value,
            body: document.querySelector('#compose-body').value,
        })
      })
      .then(response => response.json())
      .then((result) => {
          // Print result
          load_mailbox('sent');
      })
      .catch((error) => console.log(error));
}

function compose_email() {
  
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}
    
function load_mailbox(mailbox) 
{
    
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
  
    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        // Print emails
        emails.forEach((item) => {
          
          const element = document.createElement('div');
          create_email(item,element,mailbox);
          element.addEventListener("click", () => email_view(item["id"])); 
          document.querySelector('#emails-view').appendChild(element);
  
        });
        // ... do something else with emails ...
    })
    .catch((error) => console.error(error));
}
  
function create_email(item,element,mailbox)
  {
  
    // we dont do anything if mailbox = inbox and mail is already archived Or mailbox = 
    // archived and mail is not archived
      if(mailbox === 'inbox' && item["archived"])
      {
        return;
      }
      else if(mailbox == 'archived' && !item["archived"])
      {
        return;
      }
  
      // creating two elements from and content
      const from = document.createElement('strong');
      const content = document.createElement('div');
  
      // if mailbox = sent we show the name of all whom we sent 
      // else the name of person whom we recieved
      if(mailbox === 'sent')
      {
        from.innerHTML = item["recipients"].join(",") + " ";
      }
      else
      {
        from.innerHTML =  item["sender"] + " ";
      }
  
      // Adding subject and from 
      content.appendChild(from);
      content.innerHTML += item['subject'];
      
  
      // adding the date to the content 
      const date = document.createElement("div");
      date.innerHTML = item["timestamp"];
      date.style.display = "inline-block";
      date.style.float = "right";
      content.appendChild(date);
  
      // Adding CSS According to the requirements
      if(item['read']){
        content.style.backgroundColor = "grey";
      }
      else{
        content.style.backgroundColor = "white";
      }
      
      content.style.padding = "10px";
      element.appendChild(content);
      // styling the outer element which we passed
      element.style.borderStyle = "Solid";
      element.style.borderWidth = "3px";
      element.style.margin = "10px";
}
  
function email_view(id)
{
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';
    document.querySelector("#email-view").innerHTML = "";
  
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        
        const from = document.createElement('div');
        const recipients = document.createElement('div');
        const subject = document.createElement('div');
        const timestamp = document.createElement('div');
        const archive_button = document.createElement('button');
        const reply_button = document.createElement('button');
        const body = document.createElement('div');
  
        from.innerHTML = `<strong> From: </strong> ${email["sender"]}`;
        recipients.innerHTML = `<strong>To: </strong> ${email["recipients"].join(", ")}`;
        subject.innerHTML = `<strong>Subject: </strong> ${email["subject"]}`;
        timestamp.innerHTML = `<strong>Timestamp: </strong> ${email["timestamp"]}`;
        body.innerHTML = email["body"];

        // Archive button
        archive_button.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-archive-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z"/></svg>';
        if(email["archived"])
        {
          archive_button.innerHTML += " Unarchive";
        }
        else
        {
          archive_button.innerHTML += " Archive";
        }
        archive_button.classList = "btn btn-outline-primary m-2";
        archive_button.addEventListener('click',() => {
          fetch(`/emails/${email["id"]}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: !email["archived"]
            })
          })
          load_mailbox('inbox');
        });

        // Reply button
        reply_button.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-reply-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.079 11.9l4.568-3.281a.719.719 0 0 0 0-1.238L9.079 4.1A.716.716 0 0 0 8 4.719V6c-1.5 0-6 0-7 8 2.5-4.5 7-4 7-4v1.281c0 .56.606.898 1.079.62z"/></svg>  Reply';
        reply_button.classList = "btn btn-outline-primary m-2";
        reply_button.addEventListener('click',() => {
          
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#email-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'block';

          document.querySelector("#compose-recipients").value = email["sender"];
          document.querySelector("#compose-subject").value = ((email["subject"].match(/^(Re:)\s/)) ? email["subject"] : "Re: " + email["subject"]); 
          document.querySelector("#compose-body").value = `On ${email["timestamp"]} ${email["sender"]} wrote:\n${email["body"]}\n-------------------------------------\n`;
    
        })

        // Appending created elements
        document.querySelector("#email-view").appendChild(from);
        document.querySelector("#email-view").appendChild(recipients);
        document.querySelector("#email-view").appendChild(subject);
        document.querySelector("#email-view").appendChild(timestamp);
        document.querySelector("#email-view").appendChild(archive_button);
        document.querySelector("#email-view").appendChild(reply_button);
        document.querySelector("#email-view").appendChild(document.createElement('hr'));
        document.querySelector("#email-view").appendChild(body);
        
    })
    .catch(error => console.log(error));
    
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read:true
      })
    })
}