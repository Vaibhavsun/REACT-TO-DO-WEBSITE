import { useState, useRef, useEffect } from 'react'
import './App.css'
import { ClipboardList, CirclePlus, Trash, Check } from 'lucide-react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const URL = "https://react-to-do-website.onrender.com"

function App() {

  const [date, setDate] = useState(new Date());
  const [optionSelect, setOptionSelect] = useState("Today");
  const inputRef = useRef("");
  const [tasks, setTasks] = useState([]);
  const [todaytask, setTodayTask] = useState([]);
  const [upcomingtask, setUpcomingTask] = useState([]);
  const [completedtask, setCompletedTask] = useState([]);
  const [showNotificationInfo, setNotificationInfo] = useState({
    message: null,
    show: false,
    button_div: null,
  });

  const handleOptionSelect = (e) => {
    setOptionSelect(e.target.innerText);
  }

  async function handleCompleteTask(id) {
    const req = await fetch(`${URL}/tasks/` + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: true })
    })

    if ((await req.json()).status != 500) {
      await new Promise((resolve) => {
        setNotificationInfo({
          message: <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center px-4">Task Completed Successfully!!</h3>,
          button_div: <button onClick={resolve} className='bg-green-500 w-[40%] sm:w-[35%] md:w-[30%] h-[44px] rounded-2xl font-semibold'>Yes</button>,
          show: true
        })
      })
      setNotificationInfo({ message: null, show: false, button_div: null })
    }

    setTasks(tasks.map(task =>
      task.id === id ? { ...task, isCompleted: 1 } : task
    ));

    setTodayTask(todaytask.filter(task => task.id !== id));
    setUpcomingTask(upcomingtask.filter(task => task.id !== id));
    setCompletedTask([...completedtask, { ...tasks.filter(task => task.id === id)[0], isCompleted: 1 }]);
  }

  async function handleDeleteTask(id) {

    let cancel = false;

    await new Promise((resolve, reject) => {
      setNotificationInfo({
        message: <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center px-4">Are you Sure?</h3>,
        button_div: (
          <>
            <button onClick={resolve} className='bg-green-500 w-[40%] sm:w-[35%] md:w-[30%] h-[44px] rounded-2xl font-semibold'>Yes</button>
            <button onClick={() => { cancel = true; reject() }} className='bg-red-500 w-[40%] sm:w-[35%] md:w-[30%] h-[44px] rounded-2xl font-semibold'>No</button>
          </>
        ),
        show: true
      })
    }).catch(() => { })

    setNotificationInfo({ message: null, show: false, button_div: null })
    if (cancel) return;

    await fetch(`${URL}/tasks/` + id, { method: "DELETE" })

    setTasks(tasks.filter(task => task.id !== id));
    setTodayTask(todaytask.filter(task => task.id !== id));
    setUpcomingTask(upcomingtask.filter(task => task.id !== id));
    setCompletedTask(completedtask.filter(task => task.id !== id));
  }

  useEffect(() => {
    async function readTask() {
      const req = await fetch(`${URL}/tasks`)
      const data = await req.json();
      setTasks(data);

      const today = new Date().toISOString().split('T')[0]

      setTodayTask(data.filter(task => task.date === today && task.isCompleted === 0))
      setUpcomingTask(data.filter(task => task.date > today && task.isCompleted === 0))
      setCompletedTask(data.filter(task => task.isCompleted === 1))
    }
    readTask();
  }, [])

  async function handleAdd() {
    if (inputRef.current.value === "") return;

    const newTask = {
      description: inputRef.current.value,
      date: date.toISOString().split('T')[0],
      isCompleted: 0
    }

    const req = await fetch(`${URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask)
    })

    const data = await req.json();

    if (req.status !== 500) {
      await new Promise((resolve) => {
        setNotificationInfo({
          message: <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center px-4">Task Added Successfully!!</h3>,
          button_div: <button onClick={resolve} className='bg-green-500 w-[40%] sm:w-[35%] md:w-[30%] h-[44px] rounded-2xl font-semibold'>Yes</button>,
          show: true
        })
      })
      setNotificationInfo({ message: null, show: false, button_div: null })
    }

    const updatedTask = [...tasks, { ...newTask, id: data.id }];
    setTasks(updatedTask);

    const today = new Date().toISOString().split('T')[0]
    setTodayTask(updatedTask.filter(task => task.date === today && task.isCompleted === 0));
    setUpcomingTask(updatedTask.filter(task => task.date > today && task.isCompleted === 0));

    inputRef.current.value = "";
  }

  let content = [];
  const source =
    optionSelect === "Today" ? todaytask :
      optionSelect === "Upcoming" ? upcomingtask :
        optionSelect === "Completed" ? completedtask : [];

  if (source.length > 0) {
    content = source.map(task => (
      <li key={task.id}
        className="w-[98%] min-h-[56px] bg-white mt-3 mx-auto border-4 border-blue-200 rounded-2xl flex pl-3 sm:pl-4 pr-2 sm:pr-3 items-center gap-2 sm:gap-4">
        <div className="flex-1 break-words text-sm sm:text-base py-2">{task.description}</div>

        {optionSelect !== "Completed" &&
          <button className="border-2 border-black rounded-lg p-1 shrink-0">
            <Check onClick={() => handleCompleteTask(task.id)} size={20} className="text-green-500" />
          </button>
        }

        <button onClick={() => handleDeleteTask(task.id)}
          className="border-2 border-black rounded-lg p-1 shrink-0">
          <Trash size={20} className="text-red-400" />
        </button>
      </li>
    ))
  } else {
    content = [<li key={0} className="text-base sm:text-xl text-gray-500 mt-10 text-center">No tasks available</li>]
  }

  return (
    <>
      {/* Full screen wrapper */}
      <div className="w-screen h-screen bg-[#E6EEF8] flex justify-center items-center overflow-hidden">
        <div className="h-full w-full flex flex-col md:flex-row md:h-[90%] md:w-[96%] md:rounded-2xl overflow-hidden shadow-xl">

          {/* Sidebar */}
          <div className="w-full md:w-[28%] lg:w-[25%] shrink-0 bg-[#2D5AB2] flex justify-center items-center py-4 md:py-0">
            <ul className="w-full flex flex-row md:flex-col gap-2 sm:gap-4 md:gap-8 justify-around md:justify-center items-center px-2 md:px-6">

              {/* Title — hidden on very small screens, shown sm+ */}
              <li className='hidden sm:flex gap-2 md:gap-3 items-center text-white text-base sm:text-lg md:text-3xl font-semibold md:mb-4'>
                <ClipboardList size={24} className="shrink-0" />
                <span>All Tasks</span>
              </li>

              {["Today", "Upcoming", "Completed"].map(item => (
                <li key={item}
                  onClick={handleOptionSelect}
                  className={`text-white text-sm sm:text-base md:text-2xl px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl cursor-pointer transition-colors
                    ${optionSelect === item ? "bg-[#6e61b6]" : "hover:bg-white/10"}`}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white flex flex-col overflow-hidden">

            {/* Header */}
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl mt-5 md:mt-8 ml-4 sm:ml-6 md:ml-10 font-bold tracking-wide shrink-0">
              MY TO-DO-LIST
            </h1>

            {/* Input */}
            <div className="mx-auto w-[92%] sm:w-[88%] md:w-[82%] border-4 border-pink-600 rounded-3xl h-[50px] sm:h-[56px] flex items-center mt-4 sm:mt-6 md:mt-8 shrink-0">
              <input ref={inputRef}
                type="text"
                placeholder="Add a new task"
                className="w-full h-full pl-4 sm:pl-5 outline-none rounded-3xl text-sm sm:text-base" />
            </div>

            {/* Add controls */}
            <div className="flex flex-row items-center gap-4 sm:gap-6 md:gap-10 justify-center mt-3 sm:mt-4 shrink-0 flex-wrap">
              <button onClick={handleAdd} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors">
                <CirclePlus size={36} className="sm:w-10 sm:h-10" />
              </button>
              <DatePicker selected={date} onChange={setDate} className="text-sm sm:text-base" />
            </div>

            {/* Task list */}
            <div className="w-[95%] sm:w-[92%] md:w-[90%] mx-auto bg-[#E6EEF8] my-4 sm:my-5 md:my-6 rounded-2xl overflow-y-auto flex-1 min-h-0">
              <ul className="w-full py-3 sm:py-4">
                {content}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationInfo.show &&
        <div className="w-screen h-screen bg-black/70 flex justify-center items-center absolute top-0 left-0 z-50 p-4">
          <div className="bg-white w-full max-w-[90%] sm:max-w-[480px] md:max-w-[420px] min-h-[180px] sm:min-h-[200px] rounded-2xl flex flex-col justify-center items-center gap-6 sm:gap-8 py-8 px-4">
            {showNotificationInfo.message}
            <div className="flex gap-4 sm:gap-6 w-full justify-center">
              {showNotificationInfo.button_div}
            </div>
          </div>
        </div>
      }
    </>
  )
}

export default App