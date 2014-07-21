		var word_list=["dhruv","apple","steave","giraffe"]; //Word list that will be comes
		var number_of_tiles=9,	//Number of tiles in grid
			current_character_number=0,
			current_word_number=0,
			perfect_word,
			flip_color,
		 	char_time_begin,
			char_time_end,
			total_score=0,
			word_score=0,
			word_time=0,
			total_time=0,
			my_timer,
			play_state=0;

		//This function Suffle the characters within word.
		//"hellow" will be "olwehl" or "lhowel" or anithing.
		String.prototype.shuffle = function ()
		{
			var a = this.split(""),
        		n = a.length;
    			for(var i = n - 1; i > 0; i--) {
        		var j = Math.floor(Math.random() * (i + 1));
        		var tmp = a[i];
        		a[i] = a[j];
        		a[j] = tmp;
    			}
    		return a.join("");
		}


		//The input word may contain white sapce at ends or may have upper n lower case.
		//This function will remove initial and ending white spaces, and converts the string to uppercase.
		function get_perfect_word(ip_word) 
		{
		 	return ip_word.trim().toUpperCase();
		}


		//Returns a character that is not previously in random_list
		function get_new_valid_char(random_list)
		{
		 	var temp_char,temp_ascci;
		 	while (true)
		 	{
		 		temp_ascci=Math.floor(Math.random()*25+65);
		 		temp_char=String.fromCharCode(temp_ascci);
		 		if(random_list.indexOf(temp_char)==-1)	
		 			return temp_char;
		 	}
		 }


		 //Replaces last char of sub_word with one character from random list. Returns the random words' array
		 //incoming: sub_word='HARSH'  and random_list='LHJKBC'
		 //RETURN array: ["HARSL","HARSH","HARSJ","HARSK","HARSB","HARSC"]
		function get_joined_option_array(sub_word,random_list)
		{
			var subword_options=[],new_word;
			for(var i=0;i<number_of_tiles;i++)
			{	
				new_word=sub_word.slice(0,sub_word.length-1)+random_list.charAt(i);
				subword_options.push(new_word);
			}
			return subword_options;
		}

		//Creates a word of random characters which will be used to replace last character at subword.
		function get_option_list_for(sub_word)
		{
			var random_list=sub_word.charAt(sub_word.length-1);
			while (random_list.length<number_of_tiles)
				random_list=random_list+get_new_valid_char(random_list);
			return get_joined_option_array(sub_word,random_list.shuffle());
		}

		//filp the passed element with type
		//if tile is true then flip type is "true"
		//if tile is true then flip type is "false"
		//if tile is to pause the tile, type is "pause"
		//if tile is to reset the tile, type is "reset"
		function flip(e,type)
		{
        	var time_req='0.4'

        	switch (type){
        	case "true":
        		flip_color='#bfdf57';    	
        		break;

        	case "false":
        		flip_color='#f08c55';
        		break;
        	case "reset":
        		flip_color="#9966FF";
        		break;

        	case "pause":
        		flip_color="#e99ae3";
        		e.innerHTML="<br/>";
        		break;
        	}
        
            if (e.style.webkitAnimationName !== 'flip_tile') {
                e.style.webkitAnimationName = 'flip_tile';
                e.style.webkitAnimationDuration = time_req+'s';
                e.style.background=flip_color;   
                setTimeout(function() {
                   e.style.webkitAnimationName = '';
                },time_req*1000);
            }
        }
	

        //Option_list will contain 9 words, correct_position has index of correct word out of those 9 in option_list
        //Function will Modify the tile content by fliping them.
        //loads a word from word-list to each tile.
		function load_options(option_list,correct_position)
		{	var e;
			var i=0;
			var id_list=["0","1","2","3","4","5","6","7","8"]
			for(;i<number_of_tiles;i++)
			{				
				e=document.getElementById(id_list[i]);
				e.innerHTML=option_list[i];
				if(correct_position==i)
					e.setAttribute("data-ans","y");
				else
					e.setAttribute("data-ans","n");
				flip(e,"reset");
				e.innerHTML=option_list[i];
			}
		}

		function get_char_score(char_time_end,char_time_begin)
		{
			var word_score=100-((char_time_end-char_time_begin-15)/60*100);
			if (word_score<10) return 10
			else return word_score;
		}


		//When game is requested to pause, this function flip the tiles to blank
		function pause_flip_all_tiles()
		{
			var e,i=0;
			current_character_number-=1;
			var id_list=["0","1","2","3","4","5","6","7","8"]
			for(;i<number_of_tiles;i++)
			{				
				e=document.getElementById(id_list[i]);
				flip(e,"pause");
			}
		}

		//updates the score bar after completion of each character.
		function update_score()
		{	char_score=0;
			if(current_character_number!=0){
			char_time_end=word_time;
			char_score=get_char_score(char_time_end,char_time_begin);
			}
			word_score=word_score+Math.round(char_score);
			total_score+=Math.round(char_score);
			document.getElementById("score_bar").innerHTML="<b>Score</b><br/>Total:<br/><B>"+total_score+"</B><br/>Word:<br/><B>"+word_score+"</B>";
		}

		//Prepares the board for next character.
		function prepare_board_for_next()
		{
			update_score();
			console.log("word_score="+word_score);
			console.log("Enterd in prepare_board_for_next current_character_number is"+current_character_number);
			current_character_number+=1;
			var correct_position;
			if(current_character_number<=perfect_word.length)
			{	
		  		var sub_word=perfect_word.slice(0,current_character_number);
		  		var option_list=get_option_list_for(sub_word);
		  		correct_position=option_list.indexOf(sub_word);
		  		load_options(option_list,correct_position);
				char_time_begin=word_time;
			}	
			else
			{
				load_word();
			}
		}

		//updates the time, sets minute,second and mili-sec for word and entire game.
		function update_time()
		{	
			total_time=total_time+1;
			word_time=word_time+1;
			t_min=Math.floor(((total_time))/600);
			t_sec=Math.floor((total_time)/10)%60;
			t_msec=Math.round((total_time)%10);
			w_min=Math.floor(((word_time))/600);
			w_sec=Math.floor((word_time)/10)%60;
			w_msec=Math.round((word_time)%10);
			document.getElementById("time_div").innerHTML="<b>Time</b><br/>Total:<br/><B>"+t_min+":"+t_sec+":"+t_msec+"</B><br/>Word:<br/><B>"+w_min+":"+w_sec+":"+w_msec+"</B>"

		}


		//Starts the timer if it was paused
		function start_timer()
		{	
			if(play_state==0)
			{
			play_state=1;
			my_timer=setInterval(function(){update_time()},100);
			}
		}

		//pauses the timer if it was running.
		function pause_timer()
		{	if(play_state==1)
			{
			play_state=0;
			clearInterval(my_timer);
			}
		}

		//Filp the image div and set the new  image for new word.
		function set_image(file_name)
		{
			var e=document.getElementById("img_box");
			flip(e,"false");
			var file_location="./"+file_name+".gif";
			e.src=file_location;
			var hint_place=document.getElementById("hint_place");
			flip(hint_place,"true");
			show_hint();
			pause_it();
			setTimeout(function(){hide_hint();play_it();},3000);
		}

		//Resumes the game, prepare the board again, and starts the timer.
		 function play_it()
		 {
		 	prepare_board_for_next();
		 		start_timer();
		 }


		 //Stopes timer and flip all tile so no options will be shown.
		 function pause_it()
		 {
		 		pause_timer();
		 		pause_flip_all_tiles();
		 }


		 //This function will respond when play/pause button will be clicked.
		 //If game is in play-mode, it will pause the game.
		 //If game is in pause-mode, it will play the game.
		 function playpause()
		 {
		 	var e=document.getElementById("play_pause_btn");
		 	if(play_state==0)
		 	{	
		 		flip(e,"false")
		 		e.innerHTML="<br/>Pause";
		 		play_it();	
		 	}	
		 	else
		 	{
		 		flip(e,"true")
		 		e.innerHTML="<br/>Play";
		 		pause_it();
		 	}
		 }


		 //If game is in playing mode. It Displays a correct word on hint tile. 
		 //If game is paused , Game is not suppose to showup a word.
		 function show_hint()
		 {	
		 	var e=document.getElementById("hint_place");
		 	if(play_state==1)
		 	e.innerHTML="<br/>Word is:<br/>'<b>"+perfect_word+"</b>'";
		 	else
		 	e.innerHTML="<br/><br/>Smart player:)";

		 }

		 //Flip the hint tile and hide the hint on it.
		 function hide_hint()
		 {
			var e=document.getElementById("hint_place");
		 	e.innerHTML="<br/><br/>Hint!!";		 	
		 	flip(e,"true");
		 }


		//When some tile is clicked,it checks if the clicked tile is correct tile or not.
		//If its correct, will flip true and new set of character will be loaded 
		//if its not correct then, it will flip false and set red.
 		function check_me(e)
 		{
 			if(play_state==1)
 			{
 			if (e.getAttribute("data-ans")=="y")
 				{
 				flip(e,"true");
 				setTimeout(function(e) {
                   prepare_board_for_next();
                },450);

 				}
 			else
 			{
 				flip(e,"false");
 			}
 		}
 		}

 		//New word is loaded, it sets character number,word time and word score to 0
 		//If the word is last word of the list then it terminates the game.
 		function load_word()
 		{
 			

 			current_character_number=0;
 			word_time=0;
 			word_score=0;
 			console.log("Word index is "+current_word_number);
 			if(current_word_number==word_list.length)
 				terminate();
 			start_timer();
		  	console.log("In word_building_begin");
		  	perfect_word=word_list[current_word_number++].trim().toUpperCase();;
		  	console.log("perfect_word received:"+perfect_word)
		  	set_image(perfect_word);
		  	current_character_number=0;
		  	
		  	//prepare_board_for_next();
 		}

 		
 		//Start up the game, and changes the button with display name "Terminate"
 		function start()
 		{	pause_timer();
 			total_score=0;
 			var e=document.getElementById("start_end_div");
 				e.className+=" end_div";
 				e.innerHTML="<br>Terminate Game";
 				flip(e,"false");
 				load_word();
 		}

 		//Terminates the running game and shows the score on alert,finally reloads the page
 		function terminate()
 		{
 			alert("Your word_score is:"+total_score);
 			location.reload();

 		}

 		//function that responses when start_terminate button clicked
 		//If game is not yet started, 
 		function start_terminate()
 		{
 			if(current_word_number==0)
 				start();
 			else
 				terminate();
 		}
		
		