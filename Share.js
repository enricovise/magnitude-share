function Share(w, aShare, m)
{
	// Slices magnitude w with respect to aShare array, ensuring that each share
	// is not less than minimum m.
	// EON 20110928 EV
	
	// Checks
	if (w < 0)
	{
		throw("Invalid magnitude");
	}
	if (m < 0)
	{
		throw("Invalid minimum");
	}
	if (aShare.length <= 0)
	{
		throw("Empty share");
	}
	for (var i = 0; i < aShare.length; i++)
	{
		if (aShare[i] < 0)
		{
			throw("Invalid share");
		}
	}
	var allZeros = true;
	for (var i = 0; i < aShare.length && allZeros; i++)
	{
		allZeros = allZeros && (aShare[i] == 0);
	}
	if (allZeros)
	{
		throw("All-zero share");
	}
	
	
	// Properties
	
	this.share = aShare;
	this.magnitude = w;
	this.min = m ? m : 1;


	// Functions
	
	this.sumFrom = function(i)
	{
		return this.sum(i, this.share.length);
	};

	this.sumTo = function(i)
	{
		return this.sum(0, i);
	};

	this.sum = function(init, end)
	{
		var s = 0;
		for (var k = init; k < end; k++)
		{
			s += this.share[k];
		}
		return s;
	};

	this.check = function (i)
	{
		if (i < 0 || i > this.share.length - 1)
		{
			throw("Out of bound [" + i + "]");
		}
	};

	this.norm = function(i, s)
	{
		return this.share[i] / (s > 0 ? s : 1);
	};

	this.getNormalized = function(i, init)
	{
		this.check(i);
		if (init != i)
		{
			this.check(init);
		}
		return this.norm(i, this.sumFrom(init));
	};

	this.getNormalizedFrom = function(i)
	{
		return this.getNormalized(i, i);
	};

	this.normalize = function ()
	{
		var temp = [];
		var s = 0;
		for (var i = 0; i < this.share.length - 1; i++)
		{
			s += this.getNormalized(i, 0);
			temp.push(this.getNormalized(i, 0));
		}
		temp.push(1 - s);
		this.share = temp;
	};

	this.formerInterval_aux = function(i)
	{
		return i == 0 ? 0 : Math.round((i == this.share.length ? 1 : this.getNormalizedFrom(i - 1)) * this.latterInterval_aux(i - 1));
	};

	this.latterInterval_aux = function(i)
	{
		return i == 0 ? this.magnitude : this.latterInterval_aux(i - 1) - this.formerInterval_aux(i);
	};

	this.toString = function()
	{
		return this.share.join(", ");
	};

	this.size = function()
	{
		return this.share.length;
	};
	
	this.getInterval = function(i)
	{
		this.check(i);
		if (this.min <= this.leastUpperBound())
		{
			return this.formerInterval_aux(i + 1);
		}
		else
		{
			return this.predefinedInterval(i);
		}
	};

	this.predefinedInterval = function(i)
	{
		if (this.share.length > 4)
		{
			return 0;
		}
		else
		{
			var sameDate;
			switch(this.magnitude)
			{
			case 3: sameDate = i == 2; break;
			case 2: sameDate = i % 2 > 0; break;
			case 1: sameDate = i != 0; break;
			case 0:
			default: sameDate = true;
			}
			return sameDate ? 0 : 1;
		}
	};

	this.getIntervalTo = function(i)
	{
		this.check(i);
		var s = 0;
		for (var k = 0; k <= i; k++)
		{
			s += this.getInterval(k);
		}
		return s;
	};

	this.minPercentage = function()
	{
		return this.min*(1 / this.magnitude);
	};

	this.leastUpperBound = function()
	{
		return this.magnitude / this.share.length;
	};

	this.ensureMin = function()
	{
		var individualPenalty = 0;
		var weak = [];
		for (var i = 0; i < this.share.length; i++)
		{
			weak[i] = false;
		}
		
		do
		{
			var totalPenalty = 0;
			var strongShare = [];
			for (var i = 0; i < this.share.length; i++)
			{
				if (!weak[i])
				{
					if (this.share[i] - individualPenalty < this.minPercentage())
					{
						weak[i] = true;
						totalPenalty += this.minPercentage() - (this.share[i] - individualPenalty);
					}
					else
					{
						strongShare.push(i);
					}
				}
			}
			individualPenalty += totalPenalty / strongShare.length;
		}
		while (totalPenalty > 0);

		for (var i = 0; i < this.share.length; i++)
		{
			if (weak[i])
			{
				this.share[i] = this.minPercentage();
			}
		}

		var sum = 0;
		var weakSharesNumber = this.share.length - strongShare.length;
		while (strongShare.length > 0)
		{
			var i = strongShare.pop();
			if (strongShare.length > 0)
			{
				sum += this.share[i] = this.share[i] - individualPenalty;
			}
			else
			{
				this.share[i] = 1 - (sum + this.minPercentage() * weakSharesNumber); 
			}
		}
	};

	// Post construction
	this.normalize();
	if (this.min <= this.leastUpperBound())
	{
		this.ensureMin();
	}
}
