addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "α", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        buyableCount: new Decimal(0),
        unlockedTime: false,
    }},
    color: "#31aeb0",
    requires: new Decimal(5), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("p", 12)) mult = mult.times(1.2)
        if (hasUpgrade("p", 31)) mult = mult.times(1.2)
        if (hasUpgrade("p", 33)) mult = mult.times(1.4)

        mult = mult.times(buyableEffect("p", 12))
        mult = mult.times(buyableEffect("p", 22))
        mult = mult.times(buyableEffect("b", 12))
        mult = mult.times(buyableEffect("b", 33))
        if (hasUpgrade("p", 22)) mult = mult.mul(upgradeEffect("p", 22))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (hasUpgrade("p", 24)) exp = exp.add(0.05)
        if (hasUpgrade("p", 34)) exp = exp.add(0.05)


        return exp
    },
    doReset(resettingLayer) {
        let keep = ["upgrades"];
        if (player.b.unlocked) keep.push("buyables")
        if (layers[resettingLayer].row > this.row) {
            layerDataReset("p", keep)
            player[this.layer].buyableCount = new Decimal(0)
            let store = 0
            for (var i in [11, 12]) {
                store = [11, 12][i]
                if (player[this.layer].buyables[store].gt(buyableEffect("b", 21))) {
                    player[this.layer].buyables[store] = buyableEffect("b", 21)
                }
                player[this.layer].buyableCount = player[this.layer].buyableCount.add(player[this.layer].buyables[store])
            }
            for (var j in [21, 22]) {
                store = [21, 22][j]
                if (player[this.layer].buyables[store].gt(buyableEffect("b", 22))) {
                    player[this.layer].buyables[store] = buyableEffect("b", 22)
                }
                player[this.layer].buyableCount = player[this.layer].buyableCount.add(player[this.layer].buyables[store])
            }
        }
    },
    passiveGeneration() {
        let effect = new Decimal(0)
        if (player.g.unlocked) effect = effect.add(buyableEffect("g", 11))
        effect = effect.mul(tmp[this.layer].gainMult)
        return effect
    },
    buyables: {
        showRespec: true,
        respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
            player[this.layer].buyables = getStartBuyables(this.layer)
            doReset(this.layer, true) // Force a reset
            player[this.layer].points = player[this.layer].points.add(player[this.layer].spentOnBuyables) // A built-in thing to keep track of this but only keeps a single value
            player[this.layer].buyableCount = new Decimal(0)
        },
        respecText: "Respec Thingies", // Text on Respec button, optional
        respecMessage: "Are you sure? Respeccing these doesn't accomplish much.",
        11: {
            title: "Point Mult", // Optional, displayed at the top in a larger font
            cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let cost = Decimal.pow(2, player[this.layer].buyableCount)
                return cost
            },
            unlocked() { return player[this.layer].unlocked },
         freeBuyableLevels() {
             let level = new Decimal(0)
             level = level.add(buyableEffect("b", 21))
             return level
         },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(0.5)
             let effect = base.mul(x.add(tmp[this.layer].buyables[this.id].freeBuyableLevels))
             return effect.add(1)
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             let bonusSigil = ""
             if (data.freeBuyableLevels.gt(0)) bonusSigil = " + " + data.freeBuyableLevels
             return "Cost: " + formatWhole(data.cost) + " prestige points\n\
Count: " + player[this.layer].buyables[this.id] + bonusSigil + "\n\
Multiplies point gain by "+ format(data.effect) +"x."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
             player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
             player[this.layer].buyableCount = player[this.layer].buyableCount.add(1)
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'89px', 'width':'160px'},
        },
        12: {
            title: "Prestige Mult", // Optional, displayed at the top in a larger font
            cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let cost = Decimal.pow(2, player[this.layer].buyableCount)
                return cost
            },
            unlocked() { return player[this.layer].unlocked },
         freeBuyableLevels() {
             let level = new Decimal(0)
             level = level.add(buyableEffect("b", 21))
             return level
         },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(0.25)
             let effect = base.mul(x.add(tmp[this.layer].buyables[this.id].freeBuyableLevels))
             return effect.add(1)
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             let bonusSigil = ""
             if (data.freeBuyableLevels.gt(0)) bonusSigil = " + " + data.freeBuyableLevels
             return "Cost: " + formatWhole(data.cost) + " prestige points\n\
Count: " + player[this.layer].buyables[this.id] + bonusSigil + "\n\
Multiplies prestige point gain by "+ format(data.effect) +"x."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
             player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
             player[this.layer].buyableCount = player[this.layer].buyableCount.add(1)
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'89px', 'width':'160px'},
        },
        21: {
            title: "Point Energy", // Optional, displayed at the top in a larger font
            cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let cost = Decimal.pow(2, player[this.layer].buyableCount)
                return cost
            },
            unlocked() { return player[this.layer].unlockedTime },
         freeBuyableLevels() {
             let level = new Decimal(0)
             level = level.add(buyableEffect("b", 22))
             return level
         },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(1.1)
             let effect = base.pow(x.add(tmp[this.layer].buyables[this.id].freeBuyableLevels))
             return effect
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             let bonusSigil = ""
             if (data.freeBuyableLevels.gt(0)) bonusSigil = " + " + data.freeBuyableLevels
             return "Cost: " + formatWhole(data.cost) + " prestige points\n\
            Count: " + player[this.layer].buyables[this.id] + bonusSigil + "\n\
            Multiplies point gain by "+ format(data.effect) +"x."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
             player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
             player[this.layer].buyableCount = player[this.layer].buyableCount.add(1)
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'89px', 'width':'160px'},
        },
        22: {
            title: "Prestige Energy", // Optional, displayed at the top in a larger font
            cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let cost = Decimal.pow(2, player[this.layer].buyableCount)
                return cost
            },
            unlocked() { return player[this.layer].unlockedTime },
         freeBuyableLevels() {
             let level = new Decimal(0)
             level = level.add(buyableEffect("b", 22))
             return level
         },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(1.04)
             let effect = base.pow(x.add(tmp[this.layer].buyables[this.id].freeBuyableLevels))
             return effect
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             let bonusSigil = ""
             if (data.freeBuyableLevels.gt(0)) bonusSigil = " + " + data.freeBuyableLevels
             return "Cost: " + formatWhole(data.cost) + " prestige points\n\
Count: " + player[this.layer].buyables[this.id] + bonusSigil + "\n\
            Multiplies prestige point gain by "+ format(data.effect) +"x."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
             player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
             player[this.layer].buyableCount = player[this.layer].buyableCount.add(1)
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'89px', 'width':'160px'},
        }
    },
    upgrades: {
        11: {
            title: "Base Boost I",
            description: "Increases base point gain by +1.",
            cost: new Decimal(6),
         unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        12: {
            title: "Prestige Boost I",
            description: "Multiplies Prestige Point gain by 1.2x.",
            cost: new Decimal(7),
         unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        13: {
            title: "Point Boost I",
            description: "Multiplies point gain by 2x.",
            cost: new Decimal(11),
         unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        14: {
            title: "Prestige Amplifier I",
            description: "Increases point gain by 1% per currently-held Prestige Point.",
            effect() {
                let base = new Decimal(0.01)
                return base.mul(player[this.layer].points).add(1)
            },
            effectDisplay(){
                return format(upgradeEffect("p", this.id))+"x"
            },
            cost: new Decimal(10),
         unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        15: {
            title: "Amplifier I",
            description: "Increases point gain by 1.5x.",
            cost: new Decimal(5),
            unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        21: {
            title: "Point Synergy",
            effect() {
                let base = new Decimal(1.1)
                return base.pow(player[this.layer].upgrades.length)
            },
            effectDisplay(){
                return format(upgradeEffect("p", this.id))+"x"
            },
            description: "Multiplies point gain by 1.1x for each prestige upgrade.",
            cost: new Decimal(8),
         unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        22: {
            title: "Prestige Synergy",
            effect() {
                let base = new Decimal(0.04)
                let effect = base.mul(player[this.layer].upgrades.length)
                return effect.add(1)
            },
            effectDisplay(){
                return format(upgradeEffect("p", this.id))+"x"
            },
            description: "Increase prestige point gain by +1.04x for each prestige upgrade.",
            cost: new Decimal(14),
         unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        23: {
            title: "Synergy Buyables",
            description: "Unlocks a new set of rebuyable upgrades.",
            cost: new Decimal(50),
         unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        24: {
            title: "Prestige Ease I",
            description: "Prestige points are 5% easier to obtain.",
            cost: new Decimal(19),
         unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        25: {
            title: "Amplifier II",
            description: "Increases point gain by 1.5x.",
            cost: new Decimal(10),
            unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        31: {
            title: "Prestige Boost II",
            description: "Multiplies Prestige Point gain by 1.2x.",
            cost: new Decimal(200),
            unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        32: {
            title: "Prestige Amplifier II",
            description: "Increases point gain by 1.1x for each purchased repeatable upgrade.",
            effect() {
                let base = new Decimal(1.1)
                return base.pow(player[this.layer].buyableCount).add(1)
            },
            effectDisplay(){
                return format(upgradeEffect("p", this.id))+"x"
            },
            cost: new Decimal(350),
         unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        33: {
            title: "Prestige Boost III",
            description: "Multiplies Prestige Point gain by 1.4x.",
            cost: new Decimal(500),
         unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        34: {
            title: "Prestige Ease II",
            description: "Prestige points are 5% easier to obtain.",
            cost: new Decimal(375),
         unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
        35: {
            title: "Amplifier III",
            description: "Increases point gain by 1.5x.",
            cost: new Decimal(175),
         unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
        },
    },
    update() {
      if (hasUpgrade(this.layer, 23)) player[this.layer].unlockedTime = true
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
})

addLayer("g", {
    name: "generators", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "γ", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
         buyableCount: new Decimal(0),
         unlockedTime: false,
         unlockOrder: 0,
         producerTiers: {
             prestige: [new Decimal(0), new Decimal(0)],
             generator: [new Decimal(0), new Decimal(0)],
             booster: [new Decimal(0), new Decimal(0)],
        }
    }},
    color: "#a3d9a5",
    requires() {
        return new Decimal(1e6).times((player.g.unlockOrder&&!player.g.unlockedTime)?1e6:1)
    },
    increaseUnlockOrder: ["b"],
    exponent: 0.875, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.times(buyableEffect("b", 31))
        mult = mult.times(buyableEffect("b", 33))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    passiveGeneration() {
        let effect = new Decimal(0)
        if (player.g.unlocked) effect = effect.add(buyableEffect("g", 21))
            effect = effect.mul(tmp[this.layer].gainMult)
            return effect
    },
    generatorBase() {
        let base = new Decimal(1.01)

        return base
    },
    generatorMultiplier() {
        let base = tmp[this.layer].generatorBase

        let additive = new Decimal(0)
        for (var i in player[this.layer].buyables) additive = additive.add(player[this.layer].buyables[i])
        let power = base.pow(additive)

        return power
    },
    generatorGlobalBoost() {
      let effect = new Decimal(1)

      if (player.g.unlocked) effect = effect.mul(tmp[this.layer].generatorMultiplier)
    mult = mult.times(buyableEffect("b", 32))
      return effect
    },
    midsection: [ ["display-text", function() { return "You are gaining a "+format(tmp.g.generatorBase)+"x boost to all Generators per bought generator, translating to a "+format(tmp.g.generatorMultiplier)+"x multiplier to your generators."}]],
    resource: "generator power", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
         type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

         row: 1,
         branches: ["p"],
         layerShown(){return player.p.unlocked},
         update(diff) {
             let tier = 0
             for (var i in player[this.layer].producerTiers) {
                 tier += 1
                 let level = 1
                 for (var j in player[this.layer].producerTiers[i]) {
                     level += 1
                     let generatorTier = tier*10 + level
                     player[this.layer].producerTiers[i][j] = player[this.layer].producerTiers[i][j].add(buyableEffect("g", generatorTier).mul(diff))
                 }
            }
         },
         buyables: {
             11: {
                 title: "Prestige Generator I", // Optional, displayed at the top in a larger font
                 cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                     let cost = Decimal.pow(1.2, x)
                     return cost
                 },
                 unlocked() { return player[this.layer].unlocked },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(1)
             let effect = base.mul(x.add(tmp[this.layer].buyables[this.id].freeBuyableLevels))
             effect = effect.mul(tmp[this.layer].generatorGlobalBoost)
             return effect
         },
         freeBuyableLevels() {
             let level = new Decimal(0)
             level = level.add(player[this.layer].producerTiers.prestige[0])
             return level
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             let bonusSigil = ""
             if (data.freeBuyableLevels.gt(0)) bonusSigil = " + " + format(data.freeBuyableLevels)
                 return "Cost: " + format(data.cost) + " generator power\n\
Count: " + player[this.layer].buyables[this.id] + bonusSigil + "\n\
Generates "+ format(data.effect.mul(tmp.p.gainMult)) +" prestige points per second."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'99px', 'width':'160px'},
             },
             12: {
                 title: "Prestige Generator II", // Optional, displayed at the top in a larger font
                 cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                     let cost = Decimal.pow(1.5, x).mul(10)
                     return cost
                 },
                 unlocked() { return player[this.layer].buyables[11].gte(1) },
         freeBuyableLevels() {
             let level = new Decimal(0)
             level = level.add(player[this.layer].producerTiers.prestige[1])
             return level
         },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(0.1)
             let effect = base.mul(x.add(tmp[this.layer].buyables[this.id].freeBuyableLevels))
             effect = effect.mul(tmp[this.layer].generatorGlobalBoost)
             return effect
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             let bonusSigil = ""
             if (data.freeBuyableLevels.gt(0)) bonusSigil = " + " + format(data.freeBuyableLevels)
                 return "Cost: " + format(data.cost) + " generator power\n\
Count: " + player[this.layer].buyables[this.id] + bonusSigil + "\n\
Generates "+ format(data.effect) +" Prestige Generator Is per second."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'99px', 'width':'160px'},
             },
             13: {
                 title: "Prestige Generator III", // Optional, displayed at the top in a larger font
                 cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                     let cost = Decimal.pow(2, x).mul(1000)
                     return cost
                 },
                 unlocked() { return player[this.layer].buyables[12].gte(1) },
         freeBuyableLevels() {
             let level = new Decimal(0)
             level = level.add(player[this.layer].producerTiers.prestige[2])
             return level
         },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(0.01)
             let effect = base.mul(x.add(tmp[this.layer].buyables[this.id].freeBuyableLevels))
             effect = effect.mul(tmp[this.layer].generatorGlobalBoost)
             return effect
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             let bonusSigil = ""
             if (data.freeBuyableLevels.gt(0)) bonusSigil = " + " + format(data.freeBuyableLevels)
                 return "Cost: " + format(data.cost) + " generator power\n\
Count: " + player[this.layer].buyables[this.id] + bonusSigil + "\n\
Generates "+ format(data.effect) +" Prestige Generator IIs per second."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'99px', 'width':'160px'},
             },
             21: {
                 title: "Generator Generator I", // Optional, displayed at the top in a larger font
                 cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                     let cost = Decimal.pow(1.5, x).mul(5)
                     return cost
                 },
                 unlocked() { return player[this.layer].unlocked },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(0.1)
             let effect = base.mul(x.add(tmp[this.layer].buyables[this.id].freeBuyableLevels))
             effect = effect.mul(tmp[this.layer].generatorGlobalBoost)
             return effect
         },
         freeBuyableLevels() {
             let level = new Decimal(0)
             level = level.add(player[this.layer].producerTiers.generator[0])
             return level
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             let bonusSigil = ""
             if (data.freeBuyableLevels.gt(0)) bonusSigil = " + " + format(data.freeBuyableLevels)
                 return "Cost: " + format(data.cost) + " generator power\n\
Count: " + player[this.layer].buyables[this.id] + bonusSigil + "\n\
Generates "+ format(data.effect.mul(tmp[this.layer].gainMult)) +" generator power per second."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'99px', 'width':'160px'},
             },
             22: {
                 title: "Generator Generator II", // Optional, displayed at the top in a larger font
                 cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                     let cost = Decimal.pow(5, x).mul(25)
                     return cost
                 },
                 unlocked() { return player[this.layer].buyables[21].gte(1) },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(0.01)
             let effect = base.mul(x.add(tmp[this.layer].buyables[this.id].freeBuyableLevels))
             effect = effect.mul(tmp[this.layer].generatorGlobalBoost)
             return effect
         },
         freeBuyableLevels() {
             let level = new Decimal(0)
             level = level.add(player[this.layer].producerTiers.generator[1])
             return level
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             let bonusSigil = ""
             if (data.freeBuyableLevels.gt(0)) bonusSigil = " + " + format(data.freeBuyableLevels)
                 return "Cost: " + format(data.cost) + " generator power\n\
Count: " + player[this.layer].buyables[this.id] + bonusSigil + "\n\
Generates "+ format(data.effect) +" Generator Generator Is per second."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'99px', 'width':'160px'},
             },
             23: {
                 title: "Generator Generator III", // Optional, displayed at the top in a larger font
                 cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                     let cost = Decimal.pow(10, x).mul(1000)
                     return cost
                 },
                 unlocked() { return player[this.layer].buyables[22].gte(1) },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(0.01)
             let effect = base.mul(x.add(tmp[this.layer].buyables[this.id].freeBuyableLevels))
             effect = effect.mul(tmp[this.layer].generatorGlobalBoost)
             return effect
         },
         freeBuyableLevels() {
             let level = new Decimal(0)
             return level
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             let bonusSigil = ""
             if (data.freeBuyableLevels.gt(0)) bonusSigil = " + " + format(data.freeBuyableLevels)
                 return "Cost: " + format(data.cost) + " generator power\n\
Count: " + player[this.layer].buyables[this.id] + bonusSigil + "\n\
Generates "+ format(data.effect) +" Generator Generator IIs per second."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'99px', 'width':'160px'},
             },
             31: {
                 title: "Booster Generator I", // Optional, displayed at the top in a larger font
                 cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                     let cost = Decimal.pow(1.5, x).mul(10)
                     if (!(player.g.unlockOrder&&!player.g.unlockedTime)) cost = cost.mul(1e6)
                     return cost
                 },
                 unlocked() { return player[this.layer].unlocked && player.b.unlocked },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(0.01)
             let effect = base.mul(x.add(tmp[this.layer].buyables[this.id].freeBuyableLevels))
             effect = effect.mul(tmp[this.layer].generatorGlobalBoost)
             return effect
         },
         freeBuyableLevels() {
             let level = new Decimal(0)
             level = level.add(player[this.layer].producerTiers.booster[0])
             return level
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             let bonusSigil = ""
             if (data.freeBuyableLevels.gt(0)) bonusSigil = " + " + format(data.freeBuyableLevels)
             return "Cost: " + format(data.cost) + " generator power\n\
Count: " + player[this.layer].buyables[this.id] + bonusSigil + "\n\
Generates "+ format(data.effect.mul(tmp.b.gainMult)) +" booster power per second."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'99px', 'width':'160px'},
             },
             32: {
                 title: "Booster Generator II", // Optional, displayed at the top in a larger font
                 cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                     let cost = Decimal.pow(5, x).mul(100)
                     if (!(player.g.unlockOrder&&!player.g.unlockedTime)) cost = cost.mul(1e8)
                         return cost
                 },
                 unlocked() { return player[this.layer].buyables[31].gte(1) },
         freeBuyableLevels() {
             let level = new Decimal(0)
             level = level.add(player[this.layer].producerTiers.booster[1])
             return level
         },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(0.001)
             let effect = base.mul(x.add(tmp[this.layer].buyables[this.id].freeBuyableLevels))
             effect = effect.mul(tmp[this.layer].generatorGlobalBoost)
             return effect
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             let bonusSigil = ""
             if (data.freeBuyableLevels.gt(0)) bonusSigil = " + " + format(data.freeBuyableLevels)
                 return "Cost: " + format(data.cost) + " generator power\n\
Count: " + player[this.layer].buyables[this.id] + bonusSigil + "\n\
Generates "+ format(data.effect) +" Booster Generator Is per second."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'99px', 'width':'160px'},
             },
         33: {
             title: "Booster Generator III", // Optional, displayed at the top in a larger font
             cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                 let cost = Decimal.pow(5, x).mul(10000)
                 if (!(player.g.unlockOrder&&!player.g.unlockedTime)) cost = cost.mul(1e10)
                     return cost
             },
             unlocked() { return player[this.layer].buyables[32].gte(1) },
         freeBuyableLevels() {
             let level = new Decimal(0)
             return level
         },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(0.0001)
             let effect = base.mul(x.add(tmp[this.layer].buyables[this.id].freeBuyableLevels))
             effect = effect.mul(tmp[this.layer].generatorGlobalBoost)
             return effect
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             let bonusSigil = ""
             if (data.freeBuyableLevels.gt(0)) bonusSigil = " + " + format(data.freeBuyableLevels)
                 return "Cost: " + format(data.cost) + " generator power\n\
Count: " + player[this.layer].buyables[this.id] + bonusSigil + "\n\
Generates "+ format(data.effect) +" Booster Generator IIs per second."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'99px', 'width':'160px'},
         },
    }
})

addLayer("b", {
    name: "boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "β", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
         buyableCount: new Decimal(0),
         unlockedTime: false,
         unlockOrder: 0,
         boosterCount: 0,
         gBoosterCount: 0,
    }},
    color: "#6e64c4",
    requires() {
        return new Decimal(1e6).times((player.b.unlockOrder&&!player.b.unlockedTime)?1e6:1)
    },
    increaseUnlockOrder: ["g"],
    exponent() {
        return new Decimal(0.65)
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.times(buyableEffect("b", 13))
        mult = mult.times(buyableEffect("b", 33))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    resource: "booster power", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    passiveGeneration() {
        let effect = new Decimal(0)
        if (player.g.unlocked) effect = effect.add(buyableEffect("g", 31))
            effect = effect.mul(tmp[this.layer].gainMult)
            return effect
    },
    baseAmount() {return player.points}, // Get the current amount of baseResource
         type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

         row: 1,
         branches: ["p"],
         buyables: {
             11: {
                 title: "Point Booster", // Optional, displayed at the top in a larger font
                 cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                     let cost = Decimal.pow(10, player[this.layer].buyables[this.id])
                     if (player[this.layer].buyables[this.id] > 1) cost = cost.div(buyableEffect("b", 23))
                     return cost
                 },
                 unlocked() { return player[this.layer].unlocked },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(2)
             let effect = base.pow(x)
             return effect
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             if (player[this.layer].boosterCount < 1) {
                 return "Unlock this Booster!\n\
Cost: " + formatWhole(data.cost) + " booster power"
             }
             return "Cost: " + formatWhole(data.cost) + " booster power\n\
Tier: " + player[this.layer].buyables[this.id] + "\n\
Multiplies point gain by "+ format(data.effect) +"x."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
             player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
             if (player[this.layer].boosterCount < 1) player[this.layer].boosterCount = 1
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'89px', 'width':'160px'},
             },
             12: {
                 title: "Prestige Booster", // Optional, displayed at the top in a larger font
                 cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                     let cost = Decimal.pow(20, player[this.layer].buyables[this.id]).mul(5)
                     if (player[this.layer].buyables[this.id] > 0) cost = cost.div(buyableEffect("b", 23))
                     return cost
                 },
                 unlocked() { return player[this.layer].boosterCount >= 1 },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(1.2)
             let effect = base.pow(x)
             return effect
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             if (player[this.layer].boosterCount < 2) {
                 return "Unlock this Booster!\n\
Cost: " + formatWhole(data.cost) + " booster power"
             }
             return "Cost: " + formatWhole(data.cost) + " booster power\n\
Tier: " + player[this.layer].buyables[this.id] + "\n\
Multiplies prestige point gain by "+ format(data.effect) +"x."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
             player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
             if (player[this.layer].boosterCount < 2) player[this.layer].boosterCount = 2
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'89px', 'width':'160px'},
             },
         13: {
             title: "Booster Booster", // Optional, displayed at the top in a larger font
             cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                 let cost = Decimal.pow(30, player[this.layer].buyables[this.id]).mul(50)
                 if (player[this.layer].buyables[this.id] > 1) cost = cost.div(buyableEffect("b", 23))
                 return cost
             },
             unlocked() { return player[this.layer].boosterCount >= 2 },
            effect(x) { // Effects of owning x of the items, x is a decimal
                let base = new Decimal(1.5)
                let effect = base.pow(x)
                return effect
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                if (player[this.layer].boosterCount < 3) {
                    return "Unlock this Booster!\n\
    Cost: " + formatWhole(data.cost) + " booster power"
                }
                return "Cost: " + formatWhole(data.cost) + " booster power\n\
    Tier: " + player[this.layer].buyables[this.id] + "\n\
    Multiplies booster power gain by "+ format(data.effect) +"x."
            },
            canAfford() {
                return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                if (player[this.layer].boosterCount < 3) player[this.layer].boosterCount = 3
            },
            buyMax() {}, // You'll have to handle this yourself if you want
            style: {'height':'89px', 'width':'160px'},
         },
         21: {
             title: "Mult Booster", // Optional, displayed at the top in a larger font
             cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                 let cost = Decimal.pow(15, player[this.layer].buyables[this.id]).mul(200)
                 if (player[this.layer].buyables[this.id] > 1) cost = cost.div(buyableEffect("b", 23))
                 return cost
             },
             unlocked() { return player[this.layer].boosterCount >= 3 },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let effect = new Decimal(x)
             return effect
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             if (player[this.layer].boosterCount < 4) {
                 return "Unlock this Booster!\n\
Cost: " + formatWhole(data.cost) + " booster power"
             }
             return "Cost: " + formatWhole(data.cost) + " booster power\n\
Tier: " + player[this.layer].buyables[this.id] + "\n\
Adds "+ formatWhole(data.effect) +" free levels to 'Point Mult and Prestige Mult' rebuyable upgrades.\n\
The levels of these upgrades do not drop below that value on higher resets."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
             player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
             if (player[this.layer].boosterCount < 4) player[this.layer].boosterCount = 4
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'120px', 'width':'160px'},
         },
         22: {
             title: "Energy Booster", // Optional, displayed at the top in a larger font
             cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                 let cost = Decimal.pow(15, player[this.layer].buyables[this.id]).mul(500)
                 if (player[this.layer].buyables[this.id] > 1) cost = cost.div(buyableEffect("b", 23))
                 return cost
             },
             unlocked() { return player[this.layer].boosterCount >= 4 },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let effect = new Decimal(x)
             return effect
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             if (player[this.layer].boosterCount < 5) {
                 return "Unlock this Booster!\n\
Cost: " + formatWhole(data.cost) + " booster power"
             }
             return "Cost: " + formatWhole(data.cost) + " booster power\n\
Tier: " + player[this.layer].buyables[this.id] + "\n\
Adds "+ formatWhole(data.effect) +" free levels to 'Point Energy and Prestige Energy' rebuyable upgrades.\n\
The levels of these upgrades do not drop below that value on higher resets."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
             player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
             if (player[this.layer].boosterCount < 5) player[this.layer].boosterCount =5
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'120px', 'width':'160px'},
         },
         23: {
             title: "Meta Booster", // Optional, displayed at the top in a larger font
             cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                 let cost = Decimal.pow(100, player[this.layer].buyables[this.id]).mul(10000)
                 return cost
             },
             unlocked() { return player[this.layer].boosterCount >= 5 },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let effect = new Decimal(2).pow(x)
             return effect
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             if (player[this.layer].boosterCount < 6) {
                 return "Unlock this Booster!\n\
Cost: " + formatWhole(data.cost) + " booster power"
             }
             return "Cost: " + formatWhole(data.cost) + " booster power\n\
            Tier: " + player[this.layer].buyables[this.id] + "\n\
            Divides all previous Boosters' tiering costs by /" + format(data.effect) + "."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
             player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
             if (player[this.layer].boosterCount < 6) player[this.layer].boosterCount = 6
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'120px', 'width':'160px'},
         },
         31: {
             title: "Generator Booster", // Optional, displayed at the top in a larger font
         cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
             let cost = Decimal.pow(15, player[this.layer].buyables[this.id]).mul(50)
             if (!(player.b.unlockOrder&&!player.b.unlockedTime)) cost = cost.mul(1000)
                     return cost
         },
         unlocked() { return player.b.unlocked && player.g.unlocked },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(1.5)
             let effect = base.pow(x)
             return effect
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             if (player[this.layer].gBoosterCount < 1) {
                 return "Unlock this Booster!\n\
Cost: " + formatWhole(data.cost) + " booster power"
             }
             return "Cost: " + formatWhole(data.cost) + " booster power\n\
Tier: " + player[this.layer].buyables[this.id] + "\n\
Multiplies generator power gain by "+format(data.effect) +"x."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
             player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
             if (player[this.layer].gBoosterCount < 1) player[this.layer].gBoosterCount = 1
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'120px', 'width':'160px'},
         },
         32: {
             title: "Meta-Generator Booster", // Optional, displayed at the top in a larger font
         cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
             let cost = Decimal.pow(50, player[this.layer].buyables[this.id]).mul(250)
             if (!(player.b.unlockOrder&&!player.b.unlockedTime)) cost = cost.mul(1000)
                 return cost
         },
         unlocked() { return player[this.layer].gBoosterCount >= 1 },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(1.05)
             let effect = base.pow(x)
             return effect
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             if (player[this.layer].gBoosterCount < 2) {
                 return "Unlock this Booster!\n\
Cost: " + formatWhole(data.cost) + " booster power"
             }
             return "Cost: " + formatWhole(data.cost) + " booster power\n\
Tier: " + player[this.layer].buyables[this.id] + "\n\
Generators run "+format(data.effect) +"x faster."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
             player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
             if (player[this.layer].gBoosterCount < 2) player[this.layer].gBoosterCount = 2
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'120px', 'width':'160px'},
         },
         33: {
             title: "Hyper Booster", // Optional, displayed at the top in a larger font
         cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
             let cost = Decimal.pow(100, player[this.layer].buyables[this.id]).mul(5000)
             if (!(player.b.unlockOrder&&!player.b.unlockedTime)) cost = cost.mul(1e6)
                 return cost
         },
         unlocked() { return player[this.layer].gBoosterCount >= 2 },
         effect(x) { // Effects of owning x of the items, x is a decimal
             let base = new Decimal(1.05)
             let effect = base.pow(x)
             return effect
         },
         display() { // Everything else displayed in the buyable button after the title
             let data = tmp[this.layer].buyables[this.id]
             if (player[this.layer].gBoosterCount < 3) {
                 return "Unlock this Booster!\n\
Cost: " + formatWhole(data.cost) + " booster power"
             }
             return "Cost: " + formatWhole(data.cost) + " booster power\n\
Tier: " + player[this.layer].buyables[this.id] + " / 200\n\
Multiplies point, prestige point, generator power, and booster power gain by "+ format(data.effect) +"x."
         },
         canAfford() {
             return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
         buy() {
             cost = tmp[this.layer].buyables[this.id].cost
             player[this.layer].points = player[this.layer].points.sub(cost)
             player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
             player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
             if (player[this.layer].gBoosterCount < 3) player[this.layer].gBoosterCount = 3
         },
         buyMax() {}, // You'll have to handle this yourself if you want
         style: {'height':'120px', 'width':'160px'},
         purchaseLimit: new Decimal(200),
         },
    },
         layerShown(){return player.p.unlocked},
})
