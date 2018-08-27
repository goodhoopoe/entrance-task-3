//

const input = {
    "devices": [
        {
            "id": "F972B82BA56A70CC579945773B6866FB",
            "name": "Посудомоечная машина",
            "power": 950,
            "duration": 3,
            "mode": "night"
        },
        {
            "id": "C515D887EDBBE669B2FDAC62F571E9E9",
            "name": "Духовка",
            "power": 2000,
            "duration": 2,
            "mode": "day"
        },
        {
            "id": "02DDD23A85DADDD71198305330CC386D",
            "name": "Холодильник",
            "power": 50,
            "duration": 24
        },
        {
            "id": "1E6276CC231716FE8EE8BC908486D41E",
            "name": "Термостат",
            "power": 50,
            "duration": 24
        },
        {
            "id": "7D9DC84AD110500D284B33C82FE6E85E",
            "name": "Кондиционер",
            "power": 850,
            "duration": 1
        }
    ],
    "rates": [
        {
            "from": 7,
            "to": 10,
            "value": 6.46
        },
        {
            "from": 10,
            "to": 17,
            "value": 5.38
        },
        {
            "from": 17,
            "to": 21,
            "value": 6.46
        },
        {
            "from": 21,
            "to": 23,
            "value": 5.38
        },
        {
            "from": 23,
            "to": 7,
            "value": 1.79
        }
    ],
    "maxPower": 2100
};
(function(input) {
    let output = {};
    output.schedule = {};
    for (let i=0;i<24;i++) {
        output.schedule[i] = [];
    }
    let rates = []; //Создаем массив тарифов
    for (let idx in input.rates) {

        let from = input.rates[idx].from;
        let to = input.rates[idx].to;
        let value = input.rates[idx].value;
        if (from < to) {
            for (let i=from;i<to;i++) {
                rates[i] = value;
            }
        }
        else if (from > to) {
            for (let i=from;i<24;i++) {
                rates[i] = value;
            }
            for (let i=0;i<to;i++) {
                rates[i] = value;
            }
        }
    }

    rates = rates.concat(rates);

    for (let idx in input.devices) { //обходим устройства по порядку и вычисляем самый дешевое тарифное время для устройства
        let device = input.devices[idx];

        //Если время цикла устройства превышает заданный mode, то считаем, что устройство может работать в любое время суток
        let mode = device.mode;
        let from,to;
        if (mode === "night" && device.duration <= 8) {
            from = 23;
            to = 31;
        } else if (mode === "day"  && device.duration <= 16){
            from = 7;
            to = 23;
        } else {
            from = 0;
            to = 24;
        }

        let deviceRates = [];
        let minRate;
        let cheapestIndex;

        if (from < to && to-from > device.duration) {
            to -= device.duration;
        }
        for (let i=from; i<to;i++) {
            let rate = 0;

            for (let j=i;j<i+device.duration;j++) {
                rate+=(device.power / 1000).toFixed(3) * rates[j] ;
            }
            deviceRates[i > 23 ? i - 24 : i] = rate;

            if (!minRate) {
                minRate = rate;
                cheapestIndex = i > 23 ? i - 24 : i;
            }
            if (minRate > rate && cheapestIndex <= i ) {
                minRate = rate;
                cheapestIndex = i > 23 ? i - 24 : i;
            }
        }
        device.rates = deviceRates;
        device.cheapestIndex = cheapestIndex;

        //Заполняем объект ответа

        for (let i=cheapestIndex;i<cheapestIndex + device.duration;i++) {
            output.schedule[i > 23 ? i - 24 : i].push(device.id);
        }

    }
    let consumed = [];
    let deviceComsumption =  {};
    let totalConsumption = 0;
    for (let i=0;i<24;i++) {
         let sum = 0;

         output.schedule[i].forEach(s => {
             if (!deviceComsumption[s]) {
                 deviceComsumption[s] = 0;
             }
             let power = input.devices.find(d => s === d.id).power;
             deviceComsumption[s] += rates[i] * (power / 1000).toFixed(3);
             sum += Number.parseFloat((power / 1000).toFixed(3));
         });

         consumed.push(sum);
         totalConsumption += sum;
    }
    output.consumedEnergy = { };
    output.consumedEnergy.devices = deviceComsumption;
    output.value = totalConsumption;

    console.log(output);
    return output;
})(input);