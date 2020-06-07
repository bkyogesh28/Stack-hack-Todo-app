document.getElementById('form-Task').addEventListener('submit', saveTask);
var temp=0;

// Save new To-Do
function saveTask(e) {
 
  let title = document.getElementById('title').value;
  let description = document.getElementById('description').value;
  let prio = document.getElementById('prio').value;
 
  let task = {
    title,
    description,
    prio
  };

  // Comparing based on the property item
function compare_item(a, b){
  if(a.prio < b.prio){
          return -1;
  }else if(a.prio > b.prio){
          return 1;
  }else{
          return 0;
  }
}


 
  if (localStorage.getItem('tasks') === null) {
    let tasks = [];
    tasks.push(task);
    tasks.sort(compare_item);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  } else {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    tasks.push(task);
    tasks.sort(compare_item);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
 
  getTasks();
  
 
  // Reset form-Task
  document.getElementById('form-Task').reset();
  e.preventDefault();
 
}
let tasksView = document.getElementById('tasks');//innerHTML


//updateStatus
function updateStatus(title,description) {
  let tasks = JSON.parse(localStorage.getItem('tasks'));
  var x,y,z;
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].title == title) {
    y=document.getElementsByClassName("status");
        if(y[i].innerHTML =="In progress"){
      y[i].innerHTML = "Completed";
        }
        else if( y[i].innerHTML =="Completed"){
          y[i].innerHTML = "In progress";
          
        }
  }
  //description
  if(tasks[i].description == description){
    z=document.getElementsByClassName("desc");
    if(y[i].textContent=="Completed"){
      z[i].innerHTML=z[i].textContent;
      z[i].innerHTML="<span style='color:red;'>"+z[i].innerHTML+"</span>";
      z[i].style.setProperty("text-decoration", "line-through");
    }
     else if (y[i].textContent =="In progress"){
      z[i].innerHTML=z[i].textContent;
      z[i].innerHTML="<span style='color:blue;'>"+z[i].innerHTML+"</span>";
      z[i].style.setProperty("text-decoration", "none");
    }
  }
//title
  if(tasks[i].title == title){
    x=document.getElementsByClassName("title");
    if(y[i].textContent=="Completed"){
      x[i].innerHTML=z[i].textContent;
      x[i].innerHTML="<span style='color:red;'>"+x[i].innerHTML+"</span>";
      x[i].style.setProperty("text-decoration", "line-through");
    }
     else if (y[i].textContent =="In progress"){
      x[i].innerHTML=z[i].textContent;
      x[i].innerHTML="<span style='color:blue;'>"+x[i].innerHTML+"</span>";
      x[i].style.setProperty("text-decoration", "none");
    }
  }


}
localStorage.setItem('tasks', JSON.stringify(tasks));
  // getTasks();
}


 // Delete To-Do 
function deleteTask(title) {
 
  let tasks = JSON.parse(localStorage.getItem('tasks'));
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].title == title) {
      tasks.splice(i, 1);
    }
  }
 
  localStorage.setItem('tasks', JSON.stringify(tasks));
  getTasks();
}
 
// Show To-Do List
function getTasks() {
 
  let tasks = JSON.parse(localStorage.getItem('tasks'));
  
 var x;
  for (let i = temp; i < tasks.length; i++) {
    
    let title = tasks[i].title;
    let description = tasks[i].description;
 
    tasksView.innerHTML +=
      `<div class="card mb-3">
        <div class="card-body">
        <div class="row">
          <div class="col-sm-2 text-left">
           
          <span class="title"onclick="updateStatus('${title}','${description}')">${title}</span>
          </div>
          <div class="col-sm-3 text-left">
         <p class="status"></p>
        </div>
          <div class="col-sm-5 text-left">
            <p class="desc">${description}</p>
            
          </div>
          <div class="col-sm-2 text-right">
            <a class="delete"href="#" onclick="deleteTask('${title}')" class="btn btn-sucess ">X</a>
          </div>
        </div>  
       </div>
      </div>`;
      x =document.getElementsByClassName("status");
      x[i].innerHTML="In progress";
 
  }
  temp = tasks.length;
}


getTasks();






