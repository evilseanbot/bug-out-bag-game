angular.module("bob", []);

function Ctrl($scope)
{
	$scope.playThrough = function() {
		$scope.resetGame();
		var thirstLevel = 0;

		while ($scope.alive()) 
		{
			$scope.minutesPassed++;
			$scope.player.thirst += 0.0231;
			$scope.drinkWater();

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

			$scope.player.capability = $scope.capability();
			// Actions effected by capability
			$scope.findWater();						


			if ($scope.minutesPassed >= 525600)
			{
				$scope.addLogEntry("You survived for a year. I need to make a tougher sim!", $scope.minutesPassed);
				$scope.player.alive = false;
			}
		}

		if ($scope.player.thirst >= 100) {
			$scope.addLogEntry("Died from thirst.", $scope.minutesPassed);
		}

		$scope.addLogEntry("Survived " + $scope.minutesPassed + " minutes", $scope.minutesPassed);
	}

	$scope.alive = function() {
		if ($scope.player.thirst >= 100)
		{
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
			for (var i in $scope.player.bag.items)
			{
				if (!drank) 
				{
					var item = $scope.player.bag.items[i];
					if (item.name == "Water Bottle")
					{
						if (item.utility > 0)
						{
							item.utility -= 10;
							if (item.utility <= 0)
							{
								$scope.addLogEntry("You drank all of a water bottle", $scope.minutesPassed);
							}

							$scope.player.thirst -= 0.82;
							drank = true;
						}
					}
				}
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
		$scope.player.alive = true;
		$scope.player.thirst = 0;
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
		var random = $scope.random(60*24);
		if (random == 1)
		{
			var random = $scope.random(100);
			if (random < $scope.player.capability)
			{
				if ($scope.hasItem('0.02 Water Purifier', $scope.player.bag))
				{
					$scope.addLogEntry("You found a pond of water, and were able to purify the water.", $scope.minutesPassed);
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
				$scope.addLogEntry("You went looking for a water source, but failed." + $scope.player.problemText, $scope.minutesPassed);
			}
		}
	}

	$scope.random = function(max)
	{
		return Math.floor(Math.random() * max);
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

	$scope.refillWater = function()
	{
		if ($scope.player.thirst < 50)
		{
			$scope.addLogEntry("You drank your fill.", $scope.minutesPassed); 						
		}
		else
		{
			$scope.addLogEntry("You drank your fill, you are no longer dehydrated.", $scope.minutesPassed)
		}
		$scope.player.thirst = 0;			

		var refilledBottles = 0;
		for (var i in $scope.player.bag.items)
		{
			var item = $scope.player.bag.items[i];

			if (item.name == 'Water Bottle')
			{
				if (item.utility < 100)
				{
					item.utility = 100;
					refilledBottles += 1;
				}
			}
		}
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
			result -= 30; 
			problems.push("Severely Dehydrated");
		}
		else if ($scope.player.thirst >= 11.1)
		{
			result -= 10;
			problems.push("Thirsty");
		}

		if (problems.length > 0)
		{
			var problemText = "You are "
			for (var i = 0; i <  problems.length; i++)
			{
				if (i != 0)
				{
					problemText += ", ";
				}
				problemText += problems[i];
			}
		}
		problemText += ".";
		$scope.player.problemText = problemText;
		return result;
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
				, volumeCCM: 47
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