////////////////////////
//
//    Hilfsfunktionen
//
function compare(a,b) {
  if (a.value < b.value)
    return 1;
  if (a.value > b.value)
    return -1;
  return 0;
}


(function(console){

    console.save = function(data, filename){

        if(!data) {
            console.error('Console.save: No data')
            return;
        }

        if(!filename) filename = 'console.json'

        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4)
        }

        var blob = new Blob([data], {type: 'text/json'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')

        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
    }
})(console)

/////////////////////////////




d3.csv("js/data.csv", function(error, csv_data) {
    d3.json("js/gemeinden2014Topo.json", function(error, json) {
        console.log("current location");
        if (error) return console.warn(error);
        //console.log(csv_data);
        var jahr_max = d3.max(csv_data, function(d) {
            return +d.INDIKATOR_JAHR;
        })
        console.log(jahr_max);
        var nested_data = d3.nest()
            .key(function(d) { return d.GEBIET_NAME})
            .entries(csv_data);
        console.log(nested_data);
        var nested_new = [];
        for(var i = 0; i<nested_data.length; i++) {
            for(var j = 0; j<nested_data[i].values.length; j++) {
                if(nested_data[i].values[j].INDIKATOR_JAHR == jahr_max) {
                    if(nested_data[i].values[j].INDIKATOR_NAME == "BFS-Nr. / SGEM" && (+nested_data[i].values[j].INDIKATOR_VALUE>0)) {
                        var nested_n_obj = {};
                        nested_n_obj.bfs = nested_data[i].values[j].INDIKATOR_VALUE;
                        nested_n_obj.gemName = nested_data[i].values[j].GEBIET_NAME;
                        for(var k = 0; k < 9; k++) {
                            nested_n_obj["ind" + k] = {};
                        }

                        nested_new.push(nested_n_obj);
                    }
                }
            }
        }
        //console.log(nested_new)

        for (i=0;i< nested_new.length;i++) {
            for(var x = 0; x<csv_data.length; x++) {
                for (a=0;a<9;a++) {
                    if (nested_new[i].gemName == csv_data[x].GEBIET_NAME) {
                        if (a==+csv_data[x].INDIKATOR_NAME.substr(0,1)) {
                            nested_new[i]['ind'+a][csv_data[x].INDIKATOR_JAHR] = csv_data[x].INDIKATOR_VALUE;
                        }
                    }
                }
            }
        }

        var gemeinden = json.objects.gemeinden2014.geometries;
        //Code zum mergen von csv_data und json
        //console.log(gemeinden);
        for (g=0;g<gemeinden.length;g++) {
            var gemeinde = gemeinden[g].properties;
            for (c=0;c<nested_new.length;c++) {
                if (gemeinde.BFS==nested_new[c].bfs) {
                    for (i=0;i<9;i++) {
                        gemeinde['ind'+i] = nested_new[c]['ind'+i];
                    }
                }
            }

        }

    console.save(json, "gemeinden2014_gefis.json") //speichert das neue json

    })
});