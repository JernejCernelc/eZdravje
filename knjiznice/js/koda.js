var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";
var napaka = 0;
var podatkiVisina= [];
var podatkiTeza= [];
var starostTrenutna;
var trenutniEHR = "";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */

function kreirajEHRzaBolnika(ime, priimek, datumRojstva, spol) {
    var sessionId = getSessionId();
    $.ajaxSetup({
        headers: {"Ehr-Session": sessionId}
    });
    $.ajax({
        url: baseUrl + "/ehr",
        type: 'POST',
        success: function (data) {
            var ehrId = data.ehrId;
            var partyData = {
                firstNames: ime,
                lastNames: priimek,
                dateOfBirth: datumRojstva,
                gender: spol,
                partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
            };
            $.ajax({
                url: baseUrl + "/demographics/party",
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(partyData),
                success: function (party) {
                    if (party.action == 'CREATE') {
                    }
                },
                error: function(err) {
                    napaka = 1;
                }
            });
            $("#preberiObstojeciEHR").append($("<option>", {
                value: ehrId,
                text: ime+" "+priimek
            }));
        }
    });

}
var _prvi = {
    ime: "Nejko",
    priimek: "Moknik",
    datumRojstva: "2006-09-11T10:54",
    spol: 0,
    telesnaVisina: 130,
    telesnaTeza: 37.00,
    telesnaTemperatura: 38.00,
    sistolicniKrvniTlak: 130,
    diastolicniKrvniTlak: 90,
    nasicenostKrviSKisikom: 95,
    merilec: "medicinska sestra Miša Klopotec"
};

var _drugi = {
    ime: "Brane",
    priimek: "Kovač",
    datumRojstva: "1990-04-16T03:10",
    spol: 0,
    telesnaVisina: 187,
    telesnaTeza: 80.00,
    telesnaTemperatura: 36.50,
    sistolicniKrvniTlak: 121,
    diastolicniKrvniTlak: 80,
    nasicenostKrviSKisikom: 100,
    merilec: "medicinska sestra Miša Klopotec"
};

var _tretji = {
    ime: "Micka",
    priimek: "Posedel",
    datumRojstva: "1927-01-03T22:30",
    spol: 1,
    telesnaVisina: 160,
    telesnaTeza: 68.00,
    telesnaTemperatura: 36.00,
    sistolicniKrvniTlak: 140,
    diastolicniKrvniTlak: 93,
    nasicenostKrviSKisikom: 92,
    merilec: "medicinska sestra Miša Klopotec"
};

function preveriPrenos(){
    setTimeout(function () {
        if(napaka) {
            $("#sporocilo").text("Prišlo je do napake med generiranjem. Poskusite ponovno!")
            //napaka = 0;
        }
        else {
            $("#sporocilo").text("Generiranje podatkov je bilo uspešno!")
        }
    }, 3000);
}
function pobrisiPrejsnjeGenerirane(){
    $("#preberiObstojeciEHR").empty();
    $("#preberiObstojeciEHR").append($("<option>", {
        value: "",
        text: ""
    }));
    $("#sporocilo").text("");
}

function generirajPodatke(stPacienta) {
    $("#sporocilo").text("Generiranje ...")
    setTimeout(function () {
        kreirajEHRzaBolnika(stPacienta.ime, stPacienta.priimek, stPacienta.datumRojstva, stPacienta.spol);
        setTimeout(function () {
            var ehr;
            for(var j = 0; j <  document.getElementById("preberiObstojeciEHR").options.length; j++) {
                if(document.getElementById("preberiObstojeciEHR").item(j).text == stPacienta.ime+" "+stPacienta.priimek) {
                    ehr = document.getElementById("preberiObstojeciEHR").item(j).value;
                }
            }
            for(var i = 1; i < 5; i++) {
                var datumInUra = generirajDatum("2016-11-21T11:40", "0"+i.toString());
                var telesnaVisina = stPacienta.telesnaVisina;
                var telesnaTeza = stPacienta.telesnaTeza + ((parseInt((Math.random()*100) % 30)- 15)/100);
                var telesnaTemperatura = stPacienta.telesnaTemperatura + ((parseInt((Math.random()*100) % 30)- 15)/100);
                var sistolicniKrvniTlak = stPacienta.sistolicniKrvniTlak + (parseInt(Math.random()*10) -5);
                var diastolicniKrvniTlak = stPacienta.diastolicniKrvniTlak + (parseInt(Math.random()*10) -5);
                var nasicenostKrviSKisikom = stPacienta.nasicenostKrviSKisikom + ((parseInt(Math.random()*10) % 3) -1);
                if(nasicenostKrviSKisikom > 100) {
                    nasicenostKrviSKisikom = 100;
                }

                dodajMeritveVitalnihZnakov(ehr, datumInUra, telesnaVisina, telesnaTeza, telesnaTemperatura, sistolicniKrvniTlak, diastolicniKrvniTlak,
                nasicenostKrviSKisikom, stPacienta.merilec);
            }
        }, 2000);
    }, 500);
}

function enableRadio(){
    var radios = document.myform.optradio;
    var x = document.getElementById("mycheck").checked;
    if(x == true) {
        for (var i=0, iLen = radios.length; i < iLen; i++) {
            radios[i].disabled = false;
        }
    }
    else {
        for (var i=0, iLen=radios.length; i < iLen; i++) {
            radios[i].disabled = true;
        }
    }

}

function generirajDatum(datum, dan) {
    var ure = parseInt((Math.random()*100) % 24);
    if(ure < 10) {
        ure.toString();
        ure = "0" + ure;
    }
    var min = parseInt((Math.random()*100) % 60);
    if(min < 10) {
        min.toString();
        min = "0" + min;
    }
    datum = datum.substring(0, 8);
    return datum+dan+"T"+ure+":"+min;
}


function dodajMeritveVitalnihZnakov(ehrId, datumInUra, telesnaVisina, telesnaTeza, telesnaTemperatura, sistolicniKrvniTlak, diastolicniKrvniTlak,
                                    nasicenostKrviSKisikom, merilec) {
    var sessionId = getSessionId();

    $.ajaxSetup({
        headers: {"Ehr-Session": sessionId}
    });
    var podatki = {
        // Struktura predloge je na voljo na naslednjem spletnem naslovu:
        // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
        "ctx/language": "en",
        "ctx/territory": "SI",
        "ctx/time": datumInUra,
        "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
        "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
        "vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
        "vital_signs/body_temperature/any_event/temperature|unit": "°C",
        "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
        "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
        "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
    };
    var parametriZahteve = {
        ehrId: ehrId,
        templateId: 'Vital Signs',
        format: 'FLAT',
        committer: merilec
    };
    $.ajax({
        url: baseUrl + "/composition?" + $.param(parametriZahteve),
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(podatki),
        success: function (res) {
        },
        error: function(err) {
            napaka = 1;
        }
    });
}

function preberiEHRodBolnika() {
    var sessionId = getSessionId();
    var ehrId = trenutniEHR;

    if (!ehrId || ehrId.trim().length == 0) {
        $("#napakaPriBranjuEhr").html("<div class=\"alert alert-danger\" role=\"alert\"><p>Napaka, prosim vnesite EHR ID!</p></div>");

    } else {
        $.ajax({
            url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
            type: 'GET',
            headers: {"Ehr-Session": sessionId},
            success: function (data) {
                var party = data.party;
                $("#imePacienta").text(party.firstNames + " " + party.lastNames);
                if(party.gender) {
                    $("#gender").text("spol: "+ party.gender.toLowerCase());
                }
                var datum = party.dateOfBirth;
                var trenutnoLeto = new Date().getFullYear();
                starost = trenutnoLeto - parseInt(datum.substring(0, 4));
                starostTrenutna = starost;
                $("#age").text("starost: "+ starost);
                $("#napakaPriBranjuEhr").empty();
            },
            error: function(err) {
                $("#napakaPriBranjuEhr").html("<div class=\"alert alert-danger\" role=\"alert\"><p>Napaka " + JSON.parse(err.responseText).userMessage + "!</p></div>");
            }
        });
    }
}


// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija

$(document).ready(function start(){
    izrisiGraf(1);
    $("#preberiObstojeciEHR").change(function(){
        $("#vpisiEhrId").val($(this).val());
    });
    $.ajax({
        type: "GET",
        url: "https://sl.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=Bazalna_presnova&callback=?",
        async: false,
        dataType: "jsonp",
        //jsonp: "jsonp",
        success: function(data, status, jqXHR) {
           $("#wikiBesedilo").text(data.query.pages[368648].extract);
        }
    });

    $("#submit").click(function(){
            trenutniEHR = $("#vpisiEhrId").val();
            preberiEHRodBolnika();
            preberiMeritveVitalnihZnakov();
            var opcija = 1;
            if(document.getElementById("mycheck").checked == true) {
                var radios = document.myform.optradio;
                for (i in radios) {
                    if (radios[i].checked) {
                        opcija = radios[i].value;
                    }
                }
            }
            setTimeout(function(){
                izrisiGraf(opcija);
            }, 1000);
    });

    $("#refresh").click(function(){
        preberiMeritveVitalnihZnakov();
        var opcija = 1;
        if(document.getElementById("mycheck").checked == true) {
            var radios = document.myform.optradio;
            for (i in radios) {
                if (radios[i].checked) {
                    opcija = radios[i].value;
                }
            }
        }
        setTimeout(function(){
            izrisiGraf(opcija);
        }, 1000);
    });
});

function izrisiGraf(opcija) {
    $("#grafPrikazi").html("<canvas id=\"graf\" width=\"400\" height=\"400\"></canvas>");
    var ctx = $("#graf");
    var datumi = [];
    var tabelaBMR = [];
    var tabelaSMR = [];
    var maksimum;
    for(i in podatkiVisina) {
        datumi.push(podatkiVisina[i].time.substring(0, 10));
        var bmr;
        if($("#spol").text == "spol: male") {
            bmr = 10*podatkiTeza[i].weight + 6.25 * podatkiVisina[i].height - 5*starostTrenutna + 5;
        }
        else if ($("#spol").text == "") {
            bmr = 10*podatkiTeza[i].weight + 6.25 * podatkiVisina[i].height - 5*starostTrenutna - 77;
        }
        else {
            bmr = 10*podatkiTeza[i].weight + 6.25 * podatkiVisina[i].height - 5*starostTrenutna - 161;
        }
        tabelaBMR.push(bmr);
        var x = document.getElementById("mycheck").checked;
        if(x == true && parseFloat(opcija) != 1) {
            tabelaSMR.push(bmr*parseFloat(opcija));
            maksimum =  Math.round(tabelaSMR[0] +100);
        }
        else {
            maksimum = Math.round(tabelaBMR[0]+20);
        }
    }
    datumi.reverse();
    tabelaBMR.reverse();
    tabelaSMR.reverse();
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datumi,
            datasets: [{
                label: 'BMR',
                data: tabelaBMR,
                borderWidth: 3,
                backgroundColor: "rgba(129,218,250,0.3)",
                borderColor: "rgba(0,34,64,0.3)"
            }, {
                label: 'SMR',
                data: tabelaSMR,
                borderWidth: 3,
                backgroundColor: "rgba(22,69,110,0.3)",
                borderColor: "rgba(22,69,110,0.3)"
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: Math.round(tabelaBMR[0]-30),
                        max: maksimum
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "kilokalorije"
                    }
                }]
            }
        }
    });
    podatkiVisina = [];
    podatkiTeza= [];

}

function preberiMeritveVitalnihZnakov() {
    var sessionId = getSessionId();

    var ehrId = trenutniEHR;
    $.ajax({
        url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
        type: 'GET',
        headers: {"Ehr-Session": sessionId},
        success: function (data) {
            var party = data.party;
            $.ajax({
                url: baseUrl + "/view/" + ehrId + "/" + "height",
                type: 'GET',
                headers: {"Ehr-Session": sessionId},
                success: function (res) {
                    if (res.length > 0) {
                        for (var i in res) {
                            podatkiVisina.push(res[i]);
                        }
                    } else {
                        $("#napakaPriBranjuEhr").html("<div class=\"alert alert-danger\" role=\"alert\"><p>Napaka, ni podatkov.</p></div>");
                    }
                },
                error: function() {
                    $("#napakaPriBranjuEhr").html("<div class=\"alert alert-danger\" role=\"alert\"><p>Napaka, ni dostopa.</p></div>");
                }
            });
            $.ajax({
                url: baseUrl + "/view/" + ehrId + "/" + "weight",
                type: 'GET',
                headers: {"Ehr-Session": sessionId},
                success: function (res) {
                    if (res.length > 0) {
                        for (var i in res) {
                            podatkiTeza.push(res[i]);
                        }
                    } else {
                        $("#napakaPriBranjuEhr").html("<div class=\"alert alert-danger\" role=\"alert\"><p>Napaka, ni podatkov.</p></div>");
                    }
                },
                error: function() {
                    $("#napakaPriBranjuEhr").html("<div class=\"alert alert-danger\" role=\"alert\"><p>Napaka, ni dostopa.</p></div>");
                }
            });
        },
        error: function(err) {
            $("#napakaPriBranjuEhr").html("<div class=\"alert alert-danger\" role=\"alert\"><p>Napaka, ni dostopa.</p></div>");
        }
    });
}


