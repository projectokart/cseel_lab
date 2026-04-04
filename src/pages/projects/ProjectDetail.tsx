import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/shared/PageTransition";
import { ArrowLeft, Star, Eye, Heart, Clock, Cpu, Tag, User, Calendar, ExternalLink } from "lucide-react";

const ALL_PROJECTS = [
  { id:"p1", title:"Arduino Weather Station with OLED Display", author:"TechMakers", difficulty:"Intermediate", category:"Electronics", subcategory:"IoT", tags:["Arduino","Sensors","OLED"], duration:"3 hrs", views:12400, likes:892, rating:4.8, img:"https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", desc:"Build a fully functional weather station that displays temperature, humidity, and pressure on an OLED screen. This project uses the DHT22 sensor for temperature and humidity, and BMP280 for barometric pressure. Data is displayed on an SSD1306 OLED display with a clean UI. You will also learn how to connect multiple I2C devices and write modular Arduino code.", featured:true, components:["Arduino Uno","DHT22 Sensor","BMP280 Module","SSD1306 OLED 0.96 inch","Jumper Wires","Breadboard"], updated:"2026-02-10" },
  { id:"p2", title:"Raspberry Pi Smart Home Automation Hub", author:"HomeGeeks", difficulty:"Advanced", category:"Electronics", subcategory:"Smart Home", tags:["Raspberry Pi","Python","Automation"], duration:"8 hrs", views:28700, likes:1920, rating:4.9, img:"https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf944f3df098f183b92727_Lab-Scientists-Beakers-edit.avif", desc:"Turn your Raspberry Pi into a complete smart home controller with voice commands and mobile app integration. Controls lights, fans, locks, and sensors through a beautiful web dashboard. Integrates with Google Home and Alexa. Uses MQTT for fast device communication. Includes a mobile app built with Flutter.", featured:true, components:["Raspberry Pi 4","5V Relay Module","PIR Motion Sensor","Zigbee USB Dongle","NodeMCU ESP8266","12V Power Supply"], updated:"2026-03-01" },
  { id:"p3", title:"Solar-Powered Plant Watering System", author:"GreenTech", difficulty:"Beginner", category:"Agriculture", subcategory:"Automation", tags:["Solar","Soil Sensor","Arduino"], duration:"2 hrs", views:8200, likes:640, rating:4.6, img:"https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", desc:"Automate your plant watering using soil moisture sensors and solar power. The system checks moisture levels every hour and activates a mini water pump when the soil is dry. Perfect beginner project that teaches sensor interfacing, power management, and relay control.", featured:false, components:["Arduino Nano","Capacitive Soil Sensor","5V Mini Water Pump","5V Relay","Solar Panel 5W","18650 Battery"], updated:"2026-01-20" },
  { id:"p4", title:"DIY Oscilloscope using STM32", author:"EmbeddedPro", difficulty:"Advanced", category:"Electronics", subcategory:"Instruments", tags:["STM32","C++","Display"], duration:"12 hrs", views:19800, likes:1340, rating:4.7, img:"https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", desc:"Build a 2-channel digital oscilloscope with triggering, cursors, and FFT analysis on a colour TFT display. Features 1MHz sampling rate, adjustable timebase, signal measurement, and waveform storage. A great deep-dive into STM32 ADC peripherals, DMA, and embedded graphics.", featured:true, components:["STM32F407","3.5 inch TFT Display","Op-Amp MCP6002","10-bit ADC Module","PCB Board","Probe Set"], updated:"2026-02-28" },
  { id:"p5", title:"ML-Powered Gesture Recognition Glove", author:"AIBuilders", difficulty:"Advanced", category:"Machine Learning", subcategory:"Wearables", tags:["TensorFlow","BLE","Python"], duration:"10 hrs", views:31200, likes:2100, rating:4.9, img:"https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif", desc:"Create a smart glove that recognizes hand gestures using a trained TensorFlow Lite model. The glove uses flex sensors and an IMU to capture hand movements, which are classified in real-time using an Arduino Nano 33 BLE. Maps gestures to keyboard shortcuts, mouse control, or game commands.", featured:true, components:["Arduino Nano 33 BLE","5x Flex Sensors","LSM9DS1 IMU","Conductive Thread","LiPo Battery 500mAh","BLE Module"], updated:"2026-03-05" },
  { id:"p6", title:"3D Printed Robot Arm with 6-DOF", author:"RoboticsTech", difficulty:"Intermediate", category:"Robotics", subcategory:"Manipulators", tags:["3D Print","Servo","Arduino"], duration:"20 hrs", views:44500, likes:3200, rating:4.8, img:"https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg", desc:"A fully articulated 6-DOF robotic arm with inverse kinematics solver, Python desktop controller, and a pneumatic gripper. All structural parts are 3D printed in PLA. Controlled via PS2 controller or PC app. Supports teach-and-playback mode for automating repetitive tasks.", featured:true, components:["6x MG996R Servo Motors","Arduino Mega 2560","PCA9685 Servo Driver","3D Printed PLA Parts","PS2 Controller Receiver","12V 5A Power Supply"], updated:"2026-02-15" },
  { id:"p7", title:"LoRa Forest Fire Detector", author:"SafetyNet", difficulty:"Intermediate", category:"Environment", subcategory:"Safety", tags:["LoRa","Fire Detection","Alert"], duration:"5 hrs", views:7800, likes:520, rating:4.5, img:"https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", desc:"Deploy low-power LoRa sensor nodes in forests to detect fire using flame sensors, MQ-2 smoke detectors, and temperature probes. Each node sends data over 10km range via LoRa radio to a central gateway that sends SMS alerts through Twilio.", featured:false, components:["LoRa SX1276 Module","Flame Sensor Module","MQ-2 Smoke Sensor","DHT22","Solar Panel","Arduino Pro Mini"], updated:"2026-01-08" },
  { id:"p8", title:"AI Attendance System with Face Recognition", author:"SchoolTech", difficulty:"Intermediate", category:"Machine Learning", subcategory:"Computer Vision", tags:["OpenCV","Face Recognition","Python"], duration:"6 hrs", views:22100, likes:1680, rating:4.7, img:"https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66be608d71d32863b2bf5487_Students-Desk-Classroom-Laptop-reverse.avif", desc:"Automate school attendance using face_recognition library on a Raspberry Pi. The system captures faces on entry, identifies them using a trained model, logs them to a CSV, and emails a daily report to the teacher.", featured:false, components:["Raspberry Pi 4","Pi Camera Module v2","Infrared Light Strip","LCD Display 16x2","Buzzer","Python face_recognition"], updated:"2026-02-20" },
  { id:"p9", title:"Bluetooth Controlled RC Crawler", author:"OffRoadFab", difficulty:"Beginner", category:"Robotics", subcategory:"RC Vehicles", tags:["Bluetooth","Motor Driver","Android"], duration:"4 hrs", views:15600, likes:1200, rating:4.6, img:"https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", desc:"Build an off-road RC crawler controlled by your Android phone via Bluetooth with a live FPV camera feed. Uses L298N motor driver for two DC motors with variable speed control. The Android app is built with MIT App Inventor and shows live video from an OV2640 camera.", featured:false, components:["L298N Motor Driver","HC-05 Bluetooth Module","Arduino Uno","OV2640 Camera Module","2x DC Motors","LiPo Battery 2200mAh"], updated:"2026-01-30" },
  { id:"p10", title:"DIY ECG Heart Monitor on Arduino", author:"MedTechDIY", difficulty:"Intermediate", category:"Health", subcategory:"Bio-signals", tags:["ECG","AD8232","Heart Monitor"], duration:"3 hrs", views:18400, likes:1450, rating:4.8, img:"https://img.freepik.com/premium-photo/chemistryfilled-beakers-beakers-with-colorful-chemical-generative-ai_722401-1517.jpg", desc:"Record and display real ECG signals using the AD8232 heart monitor module connected to an Arduino. Data is plotted on the serial plotter and sent over Bluetooth to a custom Android app. Includes lead-off detection and heart rate calculation from R-peak detection.", featured:false, components:["AD8232 ECG Module","Arduino Uno","3x ECG Electrodes","HC-05 Bluetooth","OLED 0.96 inch","USB Cable"], updated:"2026-03-10" },
  { id:"p11", title:"Voice Controlled Smart Mirror", author:"MirrorMakers", difficulty:"Advanced", category:"Electronics", subcategory:"Smart Home", tags:["Magic Mirror","Raspberry Pi","Voice"], duration:"15 hrs", views:36900, likes:2780, rating:4.9, img:"https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif", desc:"Build a two-way mirror with an embedded display showing weather, news, calendar, reminders, and more, controlled by voice commands using MagicMirror2 framework on a Raspberry Pi. The two-way mirror glass creates the illusion of a smart display built into a mirror.", featured:true, components:["Raspberry Pi 3B+","Old Monitor or Display","Two-Way Mirror Glass","USB Microphone","PIR Motion Sensor","MagicMirror2 Software"], updated:"2026-02-25" },
  { id:"p12", title:"CNC Pen Plotter from Old CD Drives", author:"RepurposeIt", difficulty:"Beginner", category:"Fabrication", subcategory:"CNC", tags:["CNC","Stepper Motor","GRBL"], duration:"6 hrs", views:9400, likes:730, rating:4.5, img:"https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", desc:"Repurpose the stepper motors from two old CD/DVD drives to build a CNC pen plotter. Controlled by GRBL firmware on an Arduino Uno with a CNC shield. Draws SVG files converted to G-code using Inkscape. Great upcycling project with real engineering value.", featured:false, components:["2x Old CD Drive Steppers","Arduino Uno","CNC Shield","A4988 Stepper Drivers","Servo for Pen Lift","GRBL Firmware"], updated:"2026-01-15" },
  { id:"p13", title:"Aquaponics Monitoring System", author:"FarmHack", difficulty:"Beginner", category:"Agriculture", subcategory:"Monitoring", tags:["pH Sensor","Water","NodeMCU"], duration:"4 hrs", views:5400, likes:320, rating:4.3, img:"https://img.freepik.com/premium-photo/physics-lab-background-with-pendulums-circuits_641503-120945.jpg", desc:"Monitor pH, water temperature, dissolved oxygen, and water level in your aquaponics or hydroponics tank. Data is logged to a Google Sheet every 5 minutes. Sends WhatsApp alerts when parameters go out of range.", featured:false, components:["NodeMCU ESP8266","pH Sensor Module","DS18B20 Waterproof Sensor","Ultrasonic HC-SR04","Relay Module","OLED 0.96 inch"], updated:"2026-01-05" },
  { id:"p14", title:"Autonomous Line Following Robot", author:"BotBuilders", difficulty:"Beginner", category:"Robotics", subcategory:"Autonomous", tags:["IR Sensor","PID","Arduino"], duration:"3 hrs", views:21000, likes:1560, rating:4.7, img:"https://img.freepik.com/premium-photo/technology-abstract-circuit-board-texture-background-hightech-futuristic-circuit-board-banner-wallpaper_1029473-136066.jpg", desc:"Build a fast PID-controlled line follower robot that navigates complex tracks with high precision. Uses 5 IR sensors for accurate path detection, L298N for motor control, and a tuned PID algorithm to handle sharp curves and crossings without losing the line.", featured:false, components:["5x IR Sensor Array","L298N Motor Driver","Arduino Uno","2x N20 Gear Motors","Robot Chassis","LiPo Battery 1000mAh"], updated:"2026-02-05" },
  { id:"p15", title:"Indoor Air Quality Monitor", author:"CleanAir", difficulty:"Intermediate", category:"Environment", subcategory:"Monitoring", tags:["MQ135","PM2.5","WiFi"], duration:"4 hrs", views:13200, likes:980, rating:4.6, img:"https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif", desc:"Monitor indoor air quality with CO2 equivalent, PM2.5 particulate matter, VOC, temperature, and humidity using an ESP32. Data is shown on an OLED and sent to Adafruit IO for live dashboards. Telegram alerts when air quality drops below safe limits.", featured:false, components:["ESP32","MQ135 CO2 Sensor","PMS5003 PM2.5 Sensor","BME680 VOC+Temp+Humidity","OLED 0.96 inch","3D Printed Enclosure"], updated:"2026-03-08" },
  { id:"p16", title:"EEG Brainwave Visualizer", author:"NeuroHacks", difficulty:"Advanced", category:"Health", subcategory:"Neuroscience", tags:["EEG","Brainwave","Python"], duration:"14 hrs", views:27600, likes:2010, rating:4.8, img:"https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf944f3df098f183b92727_Lab-Scientists-Beakers-edit.avif", desc:"Build a brainwave visualizer using EEG headset data, FFT analysis, and a real-time Python dashboard. Reads raw EEG signals from an OpenBCI Cyton board, applies bandpass filters to extract alpha, beta, theta, delta waves, and visualizes them in a live Matplotlib dashboard.", featured:true, components:["OpenBCI Cyton Board","EEG Electrodes Set","Python 3.10","Matplotlib","SciPy","Bluetooth USB Dongle"], updated:"2026-03-12" },
];

const diffColor: Record<string,string> = {
  Beginner:"bg-green-100 text-green-700 border-green-200",
  Intermediate:"bg-blue-100 text-blue-700 border-blue-200",
  Advanced:"bg-purple-100 text-purple-700 border-purple-200",
};
const fmt = (n:number) => n>=1000?(n/1000).toFixed(1)+"k":String(n);

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const project = ALL_PROJECTS.find(p => p.id === id);

  if (!project) {
    return (
      <PageTransition>
        <Layout>
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="text-5xl">🔧</div>
            <h2 className="text-2xl font-bold text-gray-800">Project Not Found</h2>
            <Link to="/projects" className="flex items-center gap-2 text-primary font-semibold hover:underline">
              <ArrowLeft className="h-4 w-4"/> Back to Projectkart
            </Link>
          </div>
        </Layout>
      </PageTransition>
    );
  }

  const related = ALL_PROJECTS.filter(p => p.id !== project.id && (p.category === project.category || p.subcategory === project.subcategory)).slice(0, 3);

  return (
    <PageTransition>
      <Layout>
        {/* Back nav */}
        <div className="border-b bg-white sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Link to="/projects" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary font-medium transition-colors">
              <ArrowLeft className="h-4 w-4"/> Projectkart
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-700 font-medium">{project.category}</span>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500 line-clamp-1">{project.title}</span>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ---- LEFT: Main content ---- */}
            <div className="lg:col-span-2">
              {/* Cover image */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 shadow-md bg-gray-100">
                <img src={project.img} alt={project.title} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"/>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur text-white text-xs font-bold rounded-full">{project.category}</span>
                  <span className="px-3 py-1 bg-black/40 backdrop-blur text-white/80 text-xs rounded-full">{project.subcategory}</span>
                </div>
              </div>

              {/* Title + meta */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${diffColor[project.difficulty]}`}>{project.difficulty}</span>
                  {project.featured && <span className="px-3 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full text-xs font-bold">⚡ Featured</span>}
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-4">{project.title}</h1>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1.5"><User className="h-4 w-4"/><span className="font-medium text-gray-700">{project.author}</span></span>
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4"/>Updated {new Date(project.updated).toLocaleDateString("en-IN", {day:"numeric", month:"short", year:"numeric"})}</span>
                  <span className="flex items-center gap-1.5"><Eye className="h-4 w-4"/>{fmt(project.views)} views</span>
                  <span className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-red-400"/>{fmt(project.likes)} likes</span>
                  <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400"/>{project.rating} rating</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4"/>{project.duration}</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
                <h2 className="text-base font-black text-gray-800 mb-3">About this Project</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{project.desc}</p>
              </div>

              {/* Tags */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
                <h2 className="text-base font-black text-gray-800 mb-3 flex items-center gap-2"><Tag className="h-4 w-4"/> Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <Link key={tag} to={`/projects`}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-primary/10 hover:text-primary text-gray-600 text-xs font-medium rounded-full transition-colors border border-transparent hover:border-primary/20">
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ---- RIGHT: Sidebar ---- */}
            <div className="flex flex-col gap-4">
              {/* Components list */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2"><Cpu className="h-4 w-4"/> Components Required</h3>
                <ul className="flex flex-col gap-2">
                  {project.components.map((c, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-black flex-shrink-0">{i+1}</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
                <h3 className="font-black text-sm mb-1">Ready to Build?</h3>
                <p className="text-xs opacity-80 mb-4">Get all components, full code, and step-by-step guide.</p>
                <button className="w-full py-2.5 bg-white text-primary font-bold text-xs rounded-full hover:bg-white/90 transition-colors">
                  View Full Guide
                </button>
                <button className="w-full py-2.5 mt-2 bg-transparent border border-white/30 text-white font-bold text-xs rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5"/> View Source Code
                </button>
              </div>

              {/* Project info card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-black text-gray-800 mb-3">Project Info</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between"><span className="text-gray-400">Category</span><span className="font-medium">{project.category}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Type</span><span className="font-medium">{project.subcategory}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Difficulty</span><span className="font-medium">{project.difficulty}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Time needed</span><span className="font-medium">{project.duration}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Author</span><span className="font-medium">{project.author}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Projects */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-black text-gray-900 mb-5">Related Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {related.map(p => (
                  <Link key={p.id} to={`/project/${p.id}`}
                    className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                    <div className="h-36 overflow-hidden bg-gray-50">
                      <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    </div>
                    <div className="p-4">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${diffColor[p.difficulty]}`}>{p.difficulty}</span>
                      <h4 className="text-sm font-bold text-gray-800 mt-2 line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h4>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3"/>{fmt(p.views)}</span>
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400 fill-yellow-400"/>{p.rating}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{p.duration}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </PageTransition>
  );
};

export default ProjectDetail;
