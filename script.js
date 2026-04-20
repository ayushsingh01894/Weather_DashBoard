const apiKey = "e66535daec5214e4435ab01262b2f92e";
let isCelsius = true;

function toggleTheme(){
document.body.classList.toggle("dark");
}

function toggleUnit(){
isCelsius = !isCelsius;
getWeather();
}

function getLocation(){
navigator.geolocation.getCurrentPosition(pos=>{
getWeatherByCoords(pos.coords.latitude,pos.coords.longitude);
});
}

async function getWeather(){
const city = document.getElementById("city").value;
fetchWeather(`q=${city}`);
}

async function getWeatherByCoords(lat,lon){
fetchWeather(`lat=${lat}&lon=${lon}`);
}

async function fetchWeather(query){

document.getElementById("loader").style.display="block";

const weatherURL =
`https://api.openweathermap.org/data/2.5/weather?${query}&units=metric&appid=${apiKey}`;

const forecastURL =
`https://api.openweathermap.org/data/2.5/forecast?${query}&units=metric&appid=${apiKey}`;

const weatherRes = await fetch(weatherURL);
const weatherData = await weatherRes.json();

if(weatherData.cod != 200){
alert(weatherData.message);
document.getElementById("loader").style.display="none";
return;
}

/* temp toggle */
let temp = weatherData.main.temp;
if(!isCelsius){
temp = (temp * 9/5) + 32;
}

document.getElementById("cityName").innerText = weatherData.name;
document.getElementById("temp").innerText =
Math.round(temp)+(isCelsius?"°C":"°F");

document.getElementById("desc").innerText =
weatherData.weather[0].description;

document.getElementById("humidity").innerText =
weatherData.main.humidity+"%";

document.getElementById("wind").innerText =
weatherData.wind.speed+" km/h";

document.getElementById("pressure").innerText =
weatherData.main.pressure;

document.getElementById("feels").innerText =
Math.round(weatherData.main.feels_like)+"°C";

document.getElementById("icon").src =
`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

/* sunrise sunset */
document.getElementById("sunrise").innerText =
new Date(weatherData.sys.sunrise*1000).toLocaleTimeString();

document.getElementById("sunset").innerText =
new Date(weatherData.sys.sunset*1000).toLocaleTimeString();

/* background change */
const condition = weatherData.weather[0].main.toLowerCase();

if(condition.includes("cloud")){
document.body.style.background =
"linear-gradient(135deg,#757f9a,#d7dde8)";
}
else if(condition.includes("rain")){
document.body.style.background =
"linear-gradient(135deg,#373B44,#4286f4)";
}
else if(condition.includes("clear")){
document.body.style.background =
"linear-gradient(135deg,#f7971e,#ffd200)";
}

/* forecast */
const forecastRes = await fetch(forecastURL);
const forecastData = await forecastRes.json();

const forecastDiv = document.getElementById("forecast");
forecastDiv.innerHTML="";

let temps = [];
let labels = [];

for(let i=0;i<5;i++){
const item = forecastData.list[i*8];

temps.push(item.main.temp);
labels.push(
new Date(item.dt_txt).toLocaleDateString("en-US",{weekday:"short"})
);

forecastDiv.innerHTML+=`
<div class="forecast-card">
<p>${labels[i]}</p>
<img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
<h4>${Math.round(item.main.temp)}°</h4>
</div>`;
}
/* hourly (next 24 hours = 8 data points) */
const hourlyDiv = document.getElementById("hourly");
hourlyDiv.innerHTML="";

let hourlyTemps = [];
let hourlyLabels = [];

for(let i=0;i<8;i++){
const item = forecastData.list[i];

let date = new Date(item.dt_txt);

/* hour format (01,02,03...) */
let hour = date.getHours().toString().padStart(2,"0");

hourlyTemps.push(item.main.temp);
hourlyLabels.push(hour+":00");

hourlyDiv.innerHTML+=`
<div class="hour-card">
<p>${hour}:00</p>
<img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
<h4>${Math.round(item.main.temp)}°</h4>
</div>`;
}

/* clean readable chart */
if(window.myChart){
window.myChart.destroy();
}

const ctx = document.getElementById("chart");

window.myChart = new Chart(ctx,{
type:"line",
data:{
labels: hourlyLabels,
datasets:[{
label:"Temperature (°C)",
data: hourlyTemps,
borderColor:"#38bdf8",
backgroundColor:"rgba(56,189,248,0.18)",
fill:true,
tension:0.45,
borderWidth:3,
pointRadius:0,
pointHoverRadius:6,
pointBackgroundColor:"#fff"
}]
},
options:{
responsive:true,
maintainAspectRatio:false,

layout:{
padding:20
},

plugins:{
legend:{display:false},
title:{
display:true,
text:"24 Hour Temperature Forecast",
color:"#ffffff",
font:{
size:18,
weight:"600"
},
padding:{
bottom:10
}
},
tooltip:{
backgroundColor:"#0f172a",
titleColor:"#fff",
bodyColor:"#fff",
padding:12,
callbacks:{
label:(ctx)=> " " + ctx.raw + "°C"
}
}
},

scales:{
x:{
grid:{display:false},
ticks:{
color:"#e2e8f0",
maxRotation:0,
autoSkip:true,
maxTicksLimit:6,
font:{
size:12
}
}
},
y:{
grid:{
color:"rgba(255,255,255,0.08)"
},
ticks:{
color:"#e2e8f0",
callback:(v)=> v+"°"
}
}
}
}
});
document.getElementById("loader").style.display="none";
}
