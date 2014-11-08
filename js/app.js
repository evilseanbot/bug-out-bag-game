angular.module("bob", []);

function Ctrl($scope)
{
	$scope.open = function(size) {
	    var modalInstance = $modal.open({
	        template: 'Hiii',
	        controller: 'Ctrl',
	        size: size
	    });

	}

	$scope.playThrough = function() {

		$scope.open('sm');

		$scope.resetGame();
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


			$scope.player.capability = $scope.capability();
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
			var drank = false;
			_($scope.player.bag.items).each(function(item) {

				if (!drank) 
				{
					if (item.name == "Water Bottle")
					{
						if (item.utility > 0)
						{
							item.utility -= 10;
							$scope.player.thirst -= 0.82;
							drank = true;
						}
					}
				}
			});
		}
	}

	$scope.eatFood = function() {
		if ($scope.player.hunger > 1)
		{
			var ate = false;
			_($scope.player.bag.items).each(function(item) {
				if (!ate) 
				{
					if (item.name == "Cotton Candy (4 bags)" || item.name == "Trail Mix")
					{
						if (item.utility > 0)
						{
							item.utility -= 10;
							if (item.utility <= 0)
							{
								$scope.addLogEntry("You ate all of a bag", $scope.minutesPassed);
							}

							if (item.name == "Cotton Candy (4 bags)")
								$scope.player.hunger -= (132.0*100.0) / (2000*30.0)

							if (item.name == "Trail Mix")
								$scope.player.hunger -= (967.0*100.0) / (2000.0*30.0)
							
							ate = true;
						}
					}
				}
			});
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

	}

	$scope.removeItem = function(index, bag)
	{
		bag.volumeFilled -= bag.items[index].volumeCCM;
		bag.items.splice(index, 1);
		$scope.error = "";					
	}

	$scope.resetGame = function()
	{
		$scope.minutesPassed = 0;
		$scope.logEntries = [];
		$scope.raining = false;
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
			if (random < $scope.player.capability)
			{
				if ($scope.hasItem('0.02 Water Purifier', $scope.player.bag))
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

			if (!$scope.hasItem("Poncho", $scope.player.bag) && !$scope.player.wetClothes)
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

	$scope.hasItem = function(itemName, bag)
	{
		for (i in bag.items)
		{
			var item = bag.items[i];
			if (item.name == itemName)
			{
				return true;
			}
		}
		return false;
	}

	$scope.drinkUp = function()
	{
		$scope.addLogEntry("You drank your fill.", $scope.minutesPassed); 						
		$scope.player.thirst = 0;					
	}

	$scope.refillWater = function()
	{
		var refilledBottles = 0;
		_($scope.player.bag.items).each(function(item){
			if (item.name == 'Water Bottle')
			{
				if (item.utility < 100)
				{
					item.utility = 100;
					refilledBottles += 1;
				}
			}
		});
		if (refilledBottles > 0)
		{
			$scope.addLogEntry("You refilled " + refilledBottles + " water bottles", $scope.minutesPassed);
		}
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


		if (problems.length > 0)
		{
			var problemText = "You are "
			_(problems).each(function(problem) { 
				if (i != 0)
				{
					problemText += ", ";
				}
				problemText += problem;
			});
		}
		problemText += ".";
		$scope.player.problemText = problemText;
		return result;
	}

	$scope.list = function(bag)
	{
		var list = [];
		var itemsInList = [];
		for (var i in bag.items)
		{
			var item = bag.items[i];
			if (itemsInList.indexOf(item.name) == -1)
			{
				itemsInList.push(item.name);
				list.push({
					name: item.name
					, volumeCCM: item.volumeCCM
					, quantity: 1 
					, index: i
				})
			}
			else {
				for (var j in list)
				{
					var listItem = list[j];
					if (item.name == listItem.name)
					{
						listItem.volumeCCM += item.volumeCCM;
						listItem.quantity++;
					}
				}
			}
		}
		return list;
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
		]
	}

	$scope.player = {
		thirst: 0
		, hunger: 0
		, alive: true
	}
}

angular.module("bob").controller("Ctrl", Ctrl);