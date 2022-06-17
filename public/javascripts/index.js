function toggleLoad(){ //Toggles the display of the loading dots

    let currentDisplay =  document.getElementById("loading").style.display;

    if(currentDisplay == "block"){
        document.getElementById("loading").style.display = "none";
    } else {
        document.getElementById("loading").style.display = "block";
    }
}

var vueinst = new Vue({
    el: '#app',
    data: {
        //For input fields
        inputDate_start: '',
        inputDate_end: '',
        suite_type: '',

        results: []
    },
    methods: {
        search: function(){

            toggleLoad();

            //Erases the nothingFound div
            document.getElementById("nothingFound").style.display = "none";

            //Prevents vue two way binding setting start or end date when only one of those is defined
            let startDate = vueinst.inputDate_start;
            let endDate = vueinst.inputDate_end;

            //If end date is before start date
            if((endDate < startDate) && endDate != ''){
                console.log("error");
            }

            //If end or start date isn't specified
            if(endDate == ''){
                endDate = startDate;
            }
            else if(startDate == ''){
                startDate = endDate;
            }

            let xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function (){
                if(this.readyState == 4 && this.status == 200){

                    let results = JSON.parse(this.responseText);

                    if(results == ""){
                        document.getElementById("nothingFound").style.display = "block";
                    }

                    vueinst.results = results;

                    toggleLoad();

                }
            }

            xhttp.open('POST', '/search', true);
            xhttp.setRequestHeader('Content-type', 'application/json');
            xhttp.send(JSON.stringify({inputDate_start: startDate, inputDate_end: endDate, suite_type: vueinst.suite_type}))

        },
        loadSuiteOptions: function(){ //Puts all suite options into select tag

            toggleLoad();

            let xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function() {
                if(this.readyState == 4 && this.status == 200){

                    let fields = JSON.parse(this.responseText);

                    let selectTag = document.getElementById("suiteSelector");

                    for(let field of fields){

                        field = field["suite_type"];
                        let option = document.createElement("OPTION");
                        option.value = field;
                        option.innerText = field;

                        selectTag.appendChild(option);
                    }

                    toggleLoad();

                }
            }

            xhttp.open('GET', '/getFields', true);
            xhttp.setRequestHeader('Content-type', 'application/json');
            xhttp.send();

        }
    },
    mounted() { //loads suite options once app element has been mounted onto DOM
        this.loadSuiteOptions();
    }
})