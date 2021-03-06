angular.module("bob", []);

function Ctrl($scope)
{
	$scope.playThrough = function() {
		$scope.resetGame();
		$scope.scenario = "Car broke down in rural Oregon";
		var thirstLevel = 0;
		var hungerLevel = 0;
		var coldLevel = 0;
		var hypoLevel = 0;

		while ($scope.alive()) 
		{
			$scope.minutesPassed++;
			$scope.player.thirst += 0.0231;
			$scope.player.hunger += 0.0023;
			$scope.drinkWater();
			$scope.eatFood();
			$scope.rain();
			$scope.adjustBodyTemp();
			$scope.useFlashlight();


			if ($scope.player.thirst < 11.1 && thirstLevel != 0)
			{
				thirstLevel = 0;
				$scope.addLogEntry("You are no longer thirsty", $scope.minutesPassed);				
			}

			if ($scope.player.thirst > 11.1 && thirstLevel == 0)
			{
				thirstLevel = 1;
				$scope.addLogEntry("You became thirsty", $scope.minutesPassed);
			}

			if ($scope.player.thirst > 50 && thirstLevel == 1)
			{
				thirstLevel = 2;
				$scope.addLogEntry("You became severely dehydrated", $scope.minutesPassed);
			}

			if ($scope.player.hunger < 2.2 && hungerLevel != 0)
			{
				hungerLevel = 0;
				$scope.addLogEntry("You are no longer hungry", $scope.minutesPassed);				
			}

			if ($scope.player.hunger > 2.2 && hungerLevel == 0)
			{
				hungerLevel = 1;
				$scope.addLogEntry("You became hungry", $scope.minutesPassed);
			}

			if ($scope.player.hunger > 10 && hungerLevel == 1)
			{
				hungerLevel = 3;
				$scope.addLogEntry("You became starving", $scope.minutesPassed);
			}

			if ($scope.airTemp() + $scope.clothesTemp() < 34 && coldLevel == 0)
			{
				coldLevel = 1;
				$scope.addLogEntry("You became cold", $scope.minutesPassed);
			}
			if ($scope.airTemp() + $scope.clothesTemp() > 34 && coldLevel == 1)
			{
				coldLevel = 0;
				$scope.addLogEntry("You are no longer cold", $scope.minutesPassed);
			}

			if ($scope.player.bodyTemp < 33.5 && hypoLevel == 0)
			{
				hypoLevel = 1;
				$scope.addLogEntry("You have mild hypothermia", $scope.minutesPassed);
			}
			if ($scope.player.bodyTemp < 23.5 && hypoLevel == 1)
			{
				hypoLevel = 2;
				$scope.addLogEntry("You have severe hypothermia", $scope.minutesPassed);
			}
			if ($scope.player.bodyTemp > 33.5 && (hypoLevel == 1 || hypoLevel == 2) )
			{
				hypoLevel = 0;
				$scope.addLogEntry("You no longer have hypothermia", $scope.minutesPassed);
			}

			// Actions effected by capability
			$scope.findWater();						


			if ($scope.minutesPassed >= 525600)
			{
				$scope.addLogEntry("You survived for a year. I need to make a tougher sim!", $scope.minutesPassed);
				$scope.player.alive = false;
			}
		}


		if ($scope.player.hunger >= 100) {
		}

		$scope.addLogEntry("Survived " + $scope.minutesPassed + " minutes", $scope.minutesPassed);
	}

	$scope.useFlashlight = function() {
		var items = $scope.player.bag.itemsl;

		if ($scope.isDark()) {
			var usableFlashlights = $scope.usableItems('Flashlight');

			if (usableFlashlights.length > 0) {
				var usableFlashlight = _.first(usableFlashlights);
				usableFlashlight.utility -= (100.0/60.0/24.0);

				if (usableFlashlight.utility <= 0) {

				    var batteries = $scope.usableItems('Battery');
				    if (batteries.length > 1) {
				    	var batteryPair = _.first(batteries, 2);
				    	batteryPair[0].utility = 0;
				    	batteryPair[1].utility = 0;
				    	usableFlashlight.utility = 100;
						$scope.addLogEntry("Used up a pair of flashlight batteries", $scope.minutesPassed);				    	
				    } else {
						$scope.addLogEntry("Used up all flashlight batteries", $scope.minutesPassed);
				    }

				}
			}		
		}
	}

	$scope.usableItems = function(name) {
		var items = $scope.player.bag.items;
		var itemsOfType = _.where(items, {name: name});
		return _.filter(itemsOfType, function(item) {
			return item.utility > 0;
		});
	}

	$scope.airTemp = function() {
		var temp = 20;
		var minute = $scope.minutesPassed % (60*24);
		if (minute > (60*12)) {
			temp -= 5;
		}

		if ($scope.raining)
		{
			temp -= 3;
		}
		return temp;
	}

	$scope.adjustBodyTemp = function() {
		var tempDistance = ($scope.airTemp() + $scope.clothesTemp()) - $scope.player.bodyTemp;
		var tempChange = tempDistance / 200.0;
		$scope.player.bodyTemp += tempChange;
	}

	$scope.clothesTemp = function() {
		if ($scope.player.naked)
		{
			return 0;
		} 
		else if ($scope.player.wetClothes)
		{
			return 5;
		} 
		else
		{ 
			return 17.5;
		}
	}

	$scope.alive = function() {


		if ($scope.player.thirst >= 100)
		{
			$scope.addLogEntry("Died from dehydration.", $scope.minutesPassed);
			return false;
		}
		else if ($scope.player.hunger >= 100)
		{
			$scope.addLogEntry("Died from starvation.", $scope.minutesPassed);
			return false;
		}
		else if ($scope.player.bodyTemp <= 20)
		{
			$scope.addLogEntry("Died from hypothermia.", $scope.minutesPassed);
			return false;
		}
		else if (!$scope.player.alive)
		{
			return false;
		}
		else
		{
			return true;
		}
	}

	$scope.drinkWater = function() {
		if ($scope.player.thirst > 1)
		{
			var waters = $scope.usableItems("Water Bottle");
			if (waters.length > 0) {
				var water = _.first(waters);
				water.utility -= 10;
				$scope.player.thirst -= 1.315;

				if (water.utility <= 0 && waters.length == 1) {
					$scope.addLogEntry("Drank last water bottle", $scope.minutesPassed);					
				}
			}
		}
	}

	$scope.eatFood = function() {
		if ($scope.player.hunger > 1)
		{
			var cottonCandy = $scope.usableItems("Cotton Candy (4 bags)");
			var trailMix = $scope.usableItems("Trail Mix");
			var foods = cottonCandy.concat(trailMix);

			if (foods.length > 0) {
				var food = _.first(foods);
				food.utility -= 10;
				if (food.utility <= 0)
				{
					$scope.addLogEntry("You ate all of a bag", $scope.minutesPassed);
				}

				if (food.name == "Cotton Candy (4 bags)")
					$scope.player.hunger -= (132.0*100.0) / (2000*30.0)

				if (food.name == "Trail Mix")
					$scope.player.hunger -= (967.0*100.0) / (2000.0*30.0)
			}
		}
	}	

	$scope.addLogEntry = function(entry, minutesPassed)
	{
		var days = parseInt(minutesPassed / (60*24));
		var hours = parseInt(minutesPassed % (60*24) / 60);
		var minutes = parseInt(minutesPassed % 60);
		$scope.logEntries.push(days +"d " + hours + "h:" + minutes + "m - " + entry);
	}

	$scope.bagSpaceLeft = function(bag) {
		return bag.volumeCapacity - bag.volumeFilled;
	}

	$scope.addToBag = function(item, bag) 
	{
		if ($scope.bagSpaceLeft(bag) < item.volumeCCM)
		{
			$scope.error = item.name + " is too bag for bag space left.";
			return;
		}

		var newItem = {
			name: item.name
			, volumeCCM: item.volumeCCM
			, utility: 100
		};

		bag.items.push(newItem);
		bag.volumeFilled += newItem.volumeCCM;
		$scope.list($scope.setup.bag);							
	}

	$scope.removeItem = function(index, bag)
	{
		bag.volumeFilled -= bag.items[index].volumeCCM;
		bag.items.splice(index, 1);
		$scope.error = "";
		$scope.list($scope.setup.bag);					
	}

	$scope.resetGame = function()
	{
		$scope.minutesPassed = 0;
		$scope.logEntries = [];
		$scope.raining = false;
		$scope.player.problems = [];
		$scope.player.alive = true;
		$scope.player.thirst = 0;
		$scope.player.hunger = 0;
		$scope.player.bodyTemp = 37.5;
		$scope.player.wetClothes = false;
		$scope.player.naked = false;
		$scope.player.bag = {
			items: $scope.clone($scope.setup.bag.items)
			, volumeCapacity: 10000
			, volumeFilled: 0
		}
	}

	$scope.clone = function(obj)
	{
		return JSON.parse(JSON.stringify(obj));
	}

	$scope.findWater = function()
	{
		var random = _.random(60*24);
		if (random == 1)
		{
			var random = _.random(100);
			if (random < $scope.findWaterCapability())
			{
				if (_.some($scope.player.bag.items, {name: '0.02 Water Purifier'}))
				{
					$scope.addLogEntry("You found a pond of water, and were able to purify the water.", $scope.minutesPassed);
					$scope.drinkUp();												
					$scope.refillWater();							
				}
				else if ($scope.player.thirst < 50)
				{
					$scope.addLogEntry("You found a pond of water, but it looked really gross.", $scope.minutesPassed);
				}
				else
				{
					$scope.addLogEntry("You found a pond of water, it looked really gross but you drank it anyway because you were so dehydrated. You died of disease shortly after.", $scope.minutesPassed);
					$scope.player.alive = false;
				}
			}
			else {
				$scope.addLogEntry("You went looking for a water source, but failed. " + $scope.player.problemText, $scope.minutesPassed);
			}
		}
	}

	$scope.rain = function()
	{
		var random = _.random(60*24*3);
		if (random == 1)
		{
			$scope.addLogEntry("It rained.", $scope.minutesPassed);
			$scope.refillWater();							
			$scope.raining = true;
			$scope.rainTimer = 0;

			if ($scope.usableItems('Poncho').length < 1 && !$scope.player.wetClothes)
			{
				$scope.addLogEntry("Your clothes became wet.", $scope.minutesPassed);
				$scope.player.wetClothes = true;
			}
		}

		if ($scope.raining) 
		{
			$scope.rainTimer += 1;
			if ($scope.rainTimer >= (60*12))
				$scope.raining = false;
		}
	}

	$scope.drinkUp = function()
	{
		$scope.addLogEntry("You drank your fill.", $scope.minutesPassed); 						
		$scope.player.thirst = 0;					
	}

	$scope.refillWater = function()
	{
		var refilledBottles = 0;

		var items = $scope.player.bag.items;
		var waters = _.where($scope.player.bag.items, {name: "Water Bottle"});
		var nonfullWaters = _.filter(waters, function(item) {
			return item.utility < 100;
		});

		_(nonfullWaters).each(function(water) {
			water.utility = 100.0;
			refilledBottles += 1;
		});

		if (refilledBottles > 0)
		{
			$scope.addLogEntry("You refilled " + refilledBottles + " water bottles", $scope.minutesPassed);
		}
	}

	$scope.findWaterCapability = function() {
		var result = $scope.capability();
		var items = $scope.player.bag.items;
		var problems = [];

		if (!_.some(items, {name: 'Map of Oregon'}))
		{
			result *= 0.25;
			problems.push("Have no map")
		} else if (!_.some(items, {name: 'Compass'}) )
		{
			result *= 0.5;
			problems.push("Have a map but no compass");
		}

		console.log(problems);

		$scope.player.problems = $scope.player.problems.concat(problems);

		console.log($scope.player.problems);

		$scope.player.problemText = $scope.problemText($scope.player.problems);

		return result;
	}

	$scope.generalCapability = function() {
		var result = $scope.capability();
		$scope.player.problemText = $scope.problemText($scope.player.problems);
		return result;
	}

	$scope.capability = function() {
		var result = 100;
		var problems = [];

		if ($scope.player.thirst >= 50)
		{
			result *= 0.5; 
			problems.push("Severely Dehydrated");
		}
		else if ($scope.player.thirst >= 11.1)
		{
			result *= 0.75;
			problems.push("Thirsty");
		}

		if ($scope.player.hunger >= 10)
		{
			result *= 0.5; 
			problems.push("Starving");
		}
		else if ($scope.player.hunger >= 2.2)
		{
			result *= 0.75;
			problems.push("Hungry");
		}

		if ($scope.airTemp() + $scope.clothesTemp() < 34)
		{
			result *= 0.75;
			problems.push("Cold");
		}

		if ($scope.player.bodyTemp < 23.5)
		{
			result *= 0.5;
			problems.push("have Severe Hypothermia");
		}
		else if ($scope.player.bodyTemp < 33.5)
		{
			result *= 0.75;
			problems.push("have Mild Hypothermia");
		}

		if ($scope.isDark() && $scope.usableItems("Flashlight").length > 0) 
		{
			result *= 0.75;
			problems.push("in Darkness lit by Flashlight")
		} else if ($scope.isDark()) 
		{
			result *= 0.50;
			problems.push("in Darkness")
		}

		$scope.player.problems = problems;
		//$scope.player.problemText = $scope.problemText(problems);
		return result;
	}

	$scope.problemText = function(problems) {
		if (problems.length > 0)
		{
			var problemText = "You are "
			_(problems).each(function(problem) { 
				if (problems.indexOf(problem) != 0)
				{
					problemText += ", ";
				}
				problemText += problem;
			});
		}
		problemText += ".";
		return problemText;		
	}

	$scope.isDark = function() {
		if ( ($scope.minutesPassed % (60*24)) > (60*12) ) {
			return true;
		} else {
			return false;
		}
	}

	$scope.list = function(bag)
	{
		var list = [];
		var names = _.uniq(_.pluck(bag.items, 'name'));
		var itemTypeCount = _.countBy(bag.items, 'name');

		_(names).each(function(itemType) {
			var item = _.first(_.where(bag.items, {name: itemType}));
			var itemToRemove = _.last(_.where(bag.items, {name: itemType}));

			list.push({
				name: itemType,
				volumeCCM: (item.volumeCCM * itemTypeCount[itemType]),
				quantity: itemTypeCount[itemType],
			    index: bag.items.indexOf(itemToRemove) 
			});
		});

		$scope.boblist = list;
	}

	$scope.setup = {
		bag: 
		{
			items: []
			, volumeCapacity: 10000
			, volumeFilled: 0						
		}
	}

	$scope.store = {
		items: [
			{
			    name: 'Water Bottle'
			    , img: 'img/waterbottle.jpg'
			    , volumeCCM: 750
			}
			, {
				name: 'Lighter'
				, img: 'img/lighter.jpg'
				, volumeCCM: 20
			}
			, {
				name: '0.02 Water Purifier'
				, img: 'img/purifier.jpg'
				, volumeCCM: 1263
			}
			, {
				name: 'Cotton Candy (4 bags)'
				, img: 'img/cottoncandy.jpg'
				, volumeCCM: 1064
			}
			, {
				name: 'Trail Mix'
				, img: 'img/trailmix.jpg'
				, volumeCCM: 1005
			}
			, {
				name: 'Assault Rifle'
				, img: 'img/assaultrifle.jpg'
				, volumeCCM: 1891
			}
			, {
				name: 'Poncho'
				, img: 'img/poncho.jpg'
				, volumeCCM: 3390
			}
			, {
				name: 'Flashlight'
				, img: 'img/flashlight.jpg'
				, volumeCCM: 98
			}
			, {
				name: 'Battery'
				, img: 'img/battery.jpg'
				, volumeCCM: 19
			}, 
			{
				name: 'Map of Oregon'
				, img: 'img/ormap.jpg'
				, volumeCCM: 100
			}, 
			{
				name: 'Compass'
				, img: 'img/compass.jpg'
				, volumeCCM: 70				
			}
		]
	}

	$scope.player = {
		thirst: 0
		, hunger: 0
		, alive: true
	}

	$scope.boblist = [];
}

angular.module("bob").controller("Ctrl", Ctrl);