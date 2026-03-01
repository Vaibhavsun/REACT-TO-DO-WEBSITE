import { useState,useRef,useEffect} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ClipboardList,CirclePlus,Trash,Check} from 'lucide-react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


function App() {

  const [date, setDate] = useState(new Date());
  const [optionSelect, setOptionSelect] = useState("Today");
  const inputRef = useRef("");
  const [tasks,setTasks] = useState([]);
  const [todaytask,setTodayTask] = useState([]);
  const [upcomingtask,setUpcomingTask] = useState([]);
  const [completedtask,setCompletedTask] = useState([]);
  const [showNotificationInfo,setNotificationInfo] = useState({
    message: null,
    show: false,
    button_div:null,
  });
  const messgRef  = useRef(null);
  const notBtnRef = useRef(null);
  const handleOptionSelect = (e) => {
    const t = e.target.innerText;
    setOptionSelect(t);
  }


  async function handleCompleteTask(id) {
    const req = await fetch("http://localhost:3000/tasks/"+id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({isCompleted: true})
    })

    if (await req.json().status !=500){
       const handleOk =() => new Promise((resolve) => {
          setNotificationInfo({message:<h3 className="message text-2xl font-bold"> Task Completed Successfully!! </h3>,
          button_div:<button onClick = {() => {resolve()}} className='bg-green-500 w-[30%] h-[30%] rounded-2xl hover:cursor-pointer'> Yes </button>,
          show:true})
          });
      await handleOk().then(() => {
        setNotificationInfo({
          message:null,
          show:false,
          button_div:null
        })
      })
    }
    setTasks(tasks.map(task => {
      if (task.id === id) {
        console.log({...task, isCompleted: 1})        
        return {...task, isCompleted: 1};
      }
      return task;
    }));
    
    setTodayTask(todaytask.filter(task => task.id !== id));
    setUpcomingTask(upcomingtask.filter(task => task.id !== id));
    console.log("Completed",[...completedtask, {...tasks.filter(task => task.id === id)[0], isCompleted: 1}])
    setCompletedTask([...completedtask, {...tasks.filter(task => task.id === id)[0], isCompleted: 1}]);
  }

  async function handleDeleteTask(id) {
     
      const handleDelQ = () => new Promise((resolve,reject) =>{
          setNotificationInfo({message:<h3 className="message text-2xl font-bold"> Are you Sure ? </h3>,
          button_div:<><button onClick = {() => {resolve()}} className='bg-green-500 w-[30%] h-[30%] rounded-2xl hover:cursor-pointer'> Yes </button>
          <button onClick = {() => {reject()}} className='bg-red-500 w-[30%] h-[30%] rounded-2xl hover:cursor-pointer'> No </button></>,
          show:true})
      })
      let isDel = 0;
      await handleDelQ().then(() => {
        setNotificationInfo({
          message:null,
          show:false,
          button_div:null
        })
      }).catch(() =>{
        isDel = 1;
        setNotificationInfo({
          message:null,
          show:false,
          button_div:null
        })
      })
      if (isDel){
        return;
      }
    const req = await fetch("http://localhost:3000/tasks/"+id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    })

    const res = await req.json();
      if (await res.status !=500){
       const handleOk = () => new Promise((resolve) => {
          setNotificationInfo({message:<h3 className="message text-2xl font-bold"> Task Deleted Successfully!! </h3>,
          button_div:<button onClick = {() => {resolve()}} className='bg-green-500 w-[30%] h-[30%] rounded-2xl hover:cursor-pointer'> Yes </button>,
          show:true})
          });
      await handleOk().then(() => {
        setNotificationInfo({
          message:null,
          show:false,
          button_div:null
        })
      })
    }

    setTasks(tasks.filter(task => task.id !== id));
    setTodayTask(todaytask.filter(task => task.id !== id));
    setUpcomingTask(upcomingtask.filter(task => task.id !== id));
    setCompletedTask(completedtask.filter(task => task.id !== id));
  }

  useEffect(() => {

      async function readTask(){
        const req = await fetch("http://localhost:3000/tasks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })

      const data = await req.json();
      setTasks(data);
      const today = new Date().toISOString().split('T')[0]

      setTodayTask(data.filter(task => task.date === today && task.isCompleted === 0))
      setUpcomingTask(data.filter(task => task.date > today))
      setCompletedTask(data.filter(task => task.isCompleted === 1))
    };
    readTask();

  },[])



  async function handleAdd(){
    if (inputRef.current.value===""){
      return;
    }
    const newTask = {
      description: inputRef.current.value,
      date:date.toISOString().split('T')[0],
      isCompleted:0
    }
    const req = await fetch("http://localhost:3000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newTask)
    });

    const data = await req.json();

    if (req.status !== 500){
          const handleOk =() => new Promise((resolve) => {
          setNotificationInfo({message:<h3 className="message text-2xl font-bold"> Task Added Successfully!! </h3>,
          button_div:<button onClick = {() => {resolve()}} className='bg-green-500 w-[30%] h-[30%] rounded-2xl hover:cursor-pointer'> Yes </button>,
          show:true})
          });
      await handleOk().then(() => {
        setNotificationInfo({
          message:null,
          show:false,
          button_div:null
        })
      })
    }
    else{
      return;
    }
    const updatedTask = [...tasks, {...newTask, id: data.id}];
    setTasks([...tasks, {...newTask, id: data.id}]);
    const today = new Date().toISOString().split('T')[0]

    setTodayTask(updatedTask.filter(task => task.date === today && task.isCompleted === 0));
    setUpcomingTask(updatedTask.filter(task => task.date > today && task.isCompleted === 0));
    inputRef.current.value = "";}

  
  let content = "";
  if (optionSelect === "Today" && todaytask.length > 0) {
    content = todaytask.map((task) => (
      <li key={task.id} className="w-[98%] h-[20%] bg-white mt-5 mx-auto border-4 border-blue-200 rounded-2xl flex pl-5 items-center overflow-clip gap-5 shadow-5xl hover:cursor-pointer"> <div className="flex-1"> {task.description} </div> <button className="border-2 border-black rounded-[10px] hover:cursor-pointer px-1 py-1"> <Check onClick = {() => handleCompleteTask(task.id)} size={25} className="text-green-500" /> </button>  <button onClick ={() => handleDeleteTask(task.id)} className="border-2 border-black rounded-[10px] hover:cursor-pointer mr-5 px-1 py-1"> <Trash size={25} className="text-red-400" /> </button></li>
    ))
  }
  else if (optionSelect === "Upcoming" && upcomingtask.length > 0) {
    content = upcomingtask.map((task) => (
      <li key={task.id} className="w-[98%] h-[20%] bg-white mt-5 mx-auto border-4 border-blue-200 rounded-2xl flex pl-5 items-center overflow-clip gap-5 shadow-5xl hover:cursor-pointer"> <div className="flex-1"> {task.description} </div> <button className="border-2 border-black rounded-[10px] hover:cursor-pointer px-1 py-1"> <Check onClick = {() => handleCompleteTask(task.id)} size={25} className="text-green-500" /> </button>  <button onClick ={() => handleDeleteTask(task.id)} className="border-2 border-black rounded-[10px] hover:cursor-pointer mr-5 px-1 py-1"> <Trash size={25} className="text-red-400" /> </button></li>
    ))
  }
  else if (optionSelect === "Completed" && completedtask.length > 0) {
    content = completedtask.map((task) => (
      <li key={task.id} className="w-[98%] h-[20%] bg-white mt-5 mx-auto border-4 border-blue-200 rounded-2xl flex pl-5 items-center overflow-clip gap-5 shadow-5xl hover:cursor-pointer"> <div className="flex-1"> {task.description} </div>  <button onClick ={() => handleDeleteTask(task.id)} className="border-2 border-black rounded-[10px] hover:cursor-pointer mr-5 px-1 py-1"> <Trash size={25} className="text-red-400" /> </button></li>
    ))
  }
  else{
    content = [<li key={0} className="text-2xl text-gray-500 mt-10 text-center">No tasks available</li>]
  }
  return (
    <>
    <div className="body w-screen h-screen bg-[#E6EEF8] flex justify-center items-center z-3" >
      <div className="container h-[90%] mx-auto flex justify-center items-center rounded-2xl overflow-hidden">
        <div className="left w-[30%]  h-full bg-[#2D5AB2] flex justify-center items-center">
          <ul className="w-full flex flex-col gap-10 h-[70%]">
            <li className='flex gap-3 justify-center items-center text-white text-4xl w-full '><ClipboardList size={40} className='text-white' /> All Tasks</li>
            <li className='flex gap-3 justify-center items-center text-white text-4xl w-full '> </li>

            <li onClick={handleOptionSelect} className={`flex items-center justify-center ${optionSelect === "Today" ? "bg-[#6e61b6]" : "bg-[#2D5AB2]"} text-white text-3xl w-full hover:bg-[#6e61b6] h-[30%] py-2 hover:cursor-pointer active:bg-[#6e61b6]`}> Today</li>
            <li onClick={handleOptionSelect} className={`flex items-center justify-center ${optionSelect === "Upcoming" ? "bg-[#6e61b6]" : "bg-[#2D5AB2]"} text-white text-3xl w-full hover:bg-[#6e61b6] h-[30%] py-2 hover:cursor-pointer`}> Upcoming</li>
            <li onClick={handleOptionSelect} className={`flex items-center justify-center ${optionSelect === "Completed" ? "bg-[#6e61b6]" : "bg-[#2D5AB2]"} text-white text-3xl w-full hover:bg-[#6e61b6] h-[30%] py-2 hover:cursor-pointer`}> Completed</li>
          </ul>

        </div>
        <div className="right w-full h-full bg-white">
          <h1 className="text-5xl mt-10 ml-10">MY TO-DO-LIST</h1>
          <div className="input mx-auto w-[80%] border-4 border-pink-600 rounded-3xl h-[10%] flex justify-center items-center mt-10">
            <input ref={inputRef} type="text" placeholder="Add a new task" className="block border-3 border-blue-600 rounded-3xl w-[99%] h-[85%] pl-5" />
          </div>
          <div className = "flex items-center gap-10" >
          <button onClick={handleAdd}><CirclePlus size={40} className="ml-30 mt-3 mb-3  text-blue-600 hover:cursor-pointer" /></button>
          <DatePicker selected={date} onChange={setDate} className="hover:cursor-pointer"/>
          </div>

          <div className="taskList w-[90%] h-[50%] mx-auto bg-[#E6EEF8] my-auto rounded-2xl overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            <ul className="w-full h-[90%]">
              {content}
            </ul>
          </div>
        </div>
      </div>
    </div>
    {showNotificationInfo.show && <div className="body w-screen h-screen bg-[rgba(0,0,0,0.8)] flex justify-center items-center z-20 absolute top-0">
      <div className="Notification bg-white w-[40%] h-[35%] rounded-2xl flex flex-col justify-center items-center shadow-2xl gap-10">
        <div  className="w-full flex items-center justify-center">
          {/* <h3 className="message text-2xl font-bold"> Post Added Successfully!! </h3> */}
          {showNotificationInfo.message}
        </div>
        <div ref={notBtnRef} className="flex flex-row justify-center items-center gap-20 w-[60%] h-[40%]">
            {showNotificationInfo.button_div}
            {/* <button ref={yesRef} className='bg-green-500 w-[30%] h-[30%] rounded-2xl hover:cursor-pointer'> Yes </button>
          <button ref={noRef} className='bg-red-500 w-[30%] h-[30%] rounded-2xl hover:cursor-pointer'> No </button> */}
        </div>
      </div>
    </div>}

    </>

    
  )
}

export default App
