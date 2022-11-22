$(document).ready(function () {
// need to call local storage and be able to set blank strings before a click event
let cityName = "";
let currentCityName = "";
let currentTemperature = "";
let currentHumidity = "";
let currentWindSpeed = "";
let currentIcon = "";
let currentUVI = "";
let lattestStoredCity = "";

const currentDate = moment().format("ll");
// stored previous searches and called
let searchHistory = [];
let searchHistoryEl = $("#search-history");
let dashboardEl = $("#daily-weather");

//save search history from local storage and weather of lattest city
loadStored();

//render search input for weather
$("#search-btn").on("click", function (event) {
    event.preventDefault();
console.log (event);
    let inputCityName = $("#search-value").val().trim();
    //console log City name
    cityName = inputCityName;
    // console.log(cityName);
    // emptyWeather();
    renderWeather();

    $("#search-value").val("");
});
//if an element in search history is clicked, a new history in local storage is prevented
$("#search-history").click(function () {
    $(this).data("clicked", true);
});

//weather search history 
$("#search-history").on("click", ".city", function (anotherEvent) {
    anotherEvent.preventDefault();

    //console log ("we are clicking on a city")
    let listCityName = $(this).data("city");
    //console log (list city name)
    cityName = listCityName;

    // emptyWeather();
    renderWeather();
});

function loadStored() {
    //latest input render
    let storedCities = JSON.parse(localStorage.getItem("cities"));

    if (storedCities !== null) {
        searchHistory = storedCities;

        for (let i = 0; i < searchHistory.length; i++) {
            //console log search history and search history [i]
            let searchHistoryStorage = searchHistory[i];
            let cityFromStorage = searchHistoryStorage.newCity;
            //console log city from storage
            let historyListEl = $(`<li class="city" data-city="` + cityFromStorage + `">` + cityFromStorage + `</li>`);
            searchHistoryEl.prepend(historyListEl);
        }

        lattestStoredCity = searchHistory[searchHistory.length - 1];
        console.log("The lattest city searched upon reload is:" + lattestStoredCity.newCity);
        cityName = lattestStoredCity.newCity;

        renderWeather();
    }
};

function renderWeather() {
    console.log('renderWeather');
    //API Key
    let APIKey = "04fd169e0aae8bb627a82ef7c675ce19";
    //building the url to query the data
    let queryURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&appid=" + APIKey;
    //log query URL

    $.ajax({
        url: queryURL,
        method: "GET"
    })
        //store retrieved data in object "response"
        .then(function (response) {
            dashboardEl.empty()
            console.log(response)
            let latitude = response[0].lat;
            let longitude = response[0].lon;

            let oneCallURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&exlude=minutely,hourly&appid=" + APIKey;

            $.ajax({
                url: oneCallURL,
                method: "GET"
            })
                //Store all data in object "weatherResponse"
                .then(function (weatherResponse) {
                    //console log a more detailed response based on location, weatherReponse
                    console.log(weatherResponse);
                    currentCityName = cityName;
                    let tempK = weatherResponse.current.temp;
                    currentTemperature = ((tempK - 273.15) * 1.80 + 32).toFixed(2);
                    currentHumidity = weatherResponse.current.humidity;
                    currentWindSpeed = weatherResponse.current.wind_speed;
                    currentIcon = "https://openweathermap.org/img/w/" + weatherResponse.current.weather[0].icon + ".png";
                    currentIconAlt = weatherResponse.current.weather[0].description;
                    currentUVI = weatherResponse.current.uvi;

                    //render dashboard
                    let dashHeaderEl = $(`<h2>` + currentCityName + `(` + currentDate + `) - <img SameSite=None" src="` + currentIcon + `"alt="` + currentIconAlt + `"></h2>`);
                    let dashTempatureEl = $(`<p>Temperature:` + currentTemperature + `F</p>`);
                    let dashHumidityEl = $(`<p>Humidity:` + currentHumidity + `%</p>`);
                    let dashWindSpeedEl = $(`<p>Wind Speed:` + currentWindSpeed + `MPH</p>`);
                    let dashUVIEl = $(`<p>UV Index:` + currentUVI + `</p>`);
                    let historyListEl = $(`<li class= "city" "data-city"` + currentCityName + `">` + currentCityName + `</li>`);

                    dashboardEl.append(dashHeaderEl);
                    dashboardEl.append(dashTempatureEl);
                    dashboardEl.append(dashHumidityEl);
                    dashboardEl.append(dashWindSpeedEl);
                    dashboardEl.append(dashUVIEl);

                    //class set to favorable moderate severe and changes colors
                    dashUVIEl.attr("data-uvi", currentUVI);
                    if (dashUVIEl.attr("data-uvi") >= 0 && dashUVIEl.attr("data-uvi") < 3) {
                        dashUVIEl.addClass("favorable");
                    } else if (dashUVIEl.attr("data-uvi") >= 3 && dashUVIEl.attr("data-uvi") < 6) {
                        dashUVIEl.addClass("moderate");
                    } else if (dashUVIEl.attr("data-uvi") >= 6) {
                        dashUVIEl.addClass("severe");
                    }

                    //5 day forecast
                    for (i = 0; i < weatherResponse.daily.length - 3; i++) {
                        let forecastDate = moment().add(i, 'days').format("l");
                        let forecastIcon = "https://openweathermap.org/img/w/" + weatherResponse.daily[i].weather[0].icon + ".png";
                        let forecastIconAlt = weatherResponse.daily[i].weather[0].description;
                        let forecastTempK = weatherResponse.daily[i].temp.day;
                        let forecastTemperature = ((forecastTempK - 273.15) * 1.80 + 32).toFixed(2);
                        let forecastHumidity = weatherResponse.daily[i].humidity;

                        let forecastEl = $("#" + i + "-day-forecast");

                        forecastEl.append(`<h3>` + forecastDate + `</h3>`);
                        forecastEl.append(`<img SameSite="None" src="` + forecastIcon + `"alt="` + forecastIconAlt + `">`);
                        forecastEl.append("<p>Temperature: " + forecastTemperature + "F </p>");
                        forecastEl.append("<p>Humidity:" + forecastHumidity + "%</p>");
                    };

                    //click on list element or page load then return, else store in new search local storage
                    if ($("#search-history").data("clicked") || cityName === lattestStoredCity.newCity) {
                        return;
                    } else {
                        //return if no city is added
                        if ($("#search-history").val === "") {
                            return;
                        }
                        // newest to search history
                        let historyListEl = $(`<li class="city" data-city="` + currentCityName + `">` + currentCityName + `</li>`);
                        searchHistoryEl.prepend(historyListEl);

                        //store in local storage by city
                        let newCity = currentCityName;
                        let newCityObject = { newCity: newCity, };

                        searchHistory.push(newCityObject);
                        localStorage.setItem("cities", JSON.stringify(searchHistory));
                    };
                })
        })
}
})
console.log("hello")