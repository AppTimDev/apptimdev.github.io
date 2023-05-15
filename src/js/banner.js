ready(function () {
    var bubbleActiveId = 0;
    var changeBanner = function (selectId) {
        //change banner background
        // var banner = document.getElementById("banner");    
        // let img = `url('../images/img${selectId}.jpg')`;
        // banner.style.backgroundImage = img;
        //console.log('changeBanner: ', selectId);    
        var banner = document.getElementById("banner-img");    
        banner.src = `./images/banner_${selectId}.jpg`;
        
        //unset the active bubble    
        var bubblesActive = document.getElementsByClassName("bubble bubble-active");
        //bubblesActive[0].className = "bubble";
        bubblesActive[0].className = bubblesActive[0].className.replace("bubble bubble-active", "bubble");
        // console.log(bubblesActive[0].className);
        
        // for (var i = 0; i < bubblesActive.length; i++) {
        //     var bubbleActive = bubblesActive[i];
        //     bubbleActive.className = "bubble";
        // }
    
        // //set selected bubble active
        var bubbles = document.getElementsByClassName("bubble");     
        bubbleActiveId = Number(selectId);
        //bubbles[bubbleActiveId].className = "bubble bubble-active";
        bubbles[bubbleActiveId].className = bubbles[bubbleActiveId].className.replace("bubble", "bubble bubble-active");
    }
    
    var counter = (function () {
        const bannerPeriod = 5000;
        var bannerTimer;
        return {
            set: function () {
                bannerTimer = setInterval(function () {
                    var bubbles = document.getElementsByClassName("bubble");
                    var nextId = (bubbleActiveId + 1) % bubbles.length;
                    changeBanner(nextId);
                }, bannerPeriod);
            },
            clear: function () {
                clearInterval(bannerTimer);
            }
        };
    })();
    
    (function () {
        //console.log('init banner');    
        var bubbles = document.getElementsByClassName("bubble");
        for (var i = 0; i < bubbles.length; i++) {
            var bubble = bubbles[i];
            bubble.addEventListener("mouseover", function (e) {
                changeBanner(e.target.innerHTML)            
                counter.clear()
            });
            bubble.addEventListener("mouseleave", function () {
                counter.set()
            });
        }
        counter.set()
    })();    
});
