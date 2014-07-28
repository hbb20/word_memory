		var word_list=["apple","cigarette","steve","giraffe","cow"]; //Word list that will be comes
		var mean_list=["A fruit,usually with red color....A fruit,usually with red color...A fruit,usually with red color....A fruit,usually with red color...A fruit,usually with red color","A small stick shaped object , used for smoking","Co-founder of Apple Inc.","An animal with tall nack","A holy animal for hindu, gives milk as well"];
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
			my_timer,pointer,
			play_state=-1,
			last_start_time=0,
			is_hint_open=false;

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
        		flip_color='#ABD0A5';    	
        		break;

        	case "false":
        		flip_color='#D0A5A5';
        		break;
        	case "reset":
        		flip_color="#6884CC";
        		break;

        	case "pause":
        		flip_color="silver";
        		e.innerHTML="<br/>";
        		break;
        	case "hint":
        		flip_color="#64A55A";
        		break;
        	case "btn_pause":
        		flip_color="#ABD0A5"
        		break;
        	case "btn_play":
        		flip_color="#f0ad4e"
        		break;
        	case "btn_start":
        		flip_color="#ABD0A5"
        		break;
        	case "word_conter":
        		flip_color="#e1e1e1"
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
				e.innerHTML="<font style='times new roman'>"+option_list[i]+"</font>";
			}
		}


		//returns a score for character 
		//will be calculated on bases of char_time_begin and char_time_end
		function get_char_score(char_time_end,char_time_begin)
		{
			var diff=total_time-char_time_begin;
			if(diff<=20)
				return 100;
			else if(diff<=38)
				return 70;
			else if(diff<=56)
				return 30;
			else
				return 10;
			
		}

		//loads a score on pointer 
		function load_score_running()
		{
			var score_run=get_char_score(total_time,char_time_begin);
			var e=document.getElementById("hint_place");
			score_run=Math.round(score_run);
			
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
				e.style['-webkit-box-shadow'] = "none";
				flip(e,"pause");
			}
		}

		//updates the score bar after completion of each character.
		function update_score()
		{	char_score=0;
			if(current_character_number!=0){
			//char_time_end=word_time;
			char_score=get_char_score(total_time,char_time_begin);
			}
			total_score+=Math.round(char_score);

			update_time();
		}

		//Prepares the board for next character.
		function prepare_board_for_next()
		{	
			current_character_number+=1;
			var correct_position;
			if(current_character_number<=perfect_word.length)
			{
		  		var sub_word=perfect_word.slice(0,current_character_number);
		  		var option_list=get_option_list_for(sub_word);
		  		correct_position=option_list.indexOf(sub_word);
		  		load_options(option_list,correct_position);
				char_time_begin=total_time;
				last_start_time=total_time;
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
			if(t_min<10)
				t_min="0"+t_min;
			if(t_sec<10)
				t_sec="0"+t_sec;
			load_score_running();
			update_progress_bar();
			var printable_total_score;
			if(total_score<10)
				printable_total_score="000"+total_score;
			else if(total_score<100)
				printable_total_score="00"+total_score;
			else if(total_score<1000)
				printable_total_score="0"+total_score;
			else
				printable_total_score=total_score;
			document.getElementById("time_box").innerHTML=t_min+':'+t_sec+':'+t_msec;
			document.getElementById("score_box").innerHTML=printable_total_score;
		}

		//adds the activeness to progress bar
		function add_active_to_progressbar()
		{
			document.getElementById("bar_one").className+=" progress-bar-striped active";
			document.getElementById("bar_two").className+=" progress-bar-striped active";
			document.getElementById("bar_three").className+=" progress-bar-striped active";
			document.getElementById("bar_four").className+=" progress-bar-striped active";
		}
		//Starts the timer if it was paused
		function start_timer()
		{	
			if(play_state==0 || play_state==-1)
			{
			play_state=1;
			my_timer=setInterval(function(){update_time()},100);
			add_active_to_progressbar();
			}
		}


		//this function stops the time bar from moving strips
		function remove_active_of_progressbar()
		{
			document.getElementById("bar_one").className="progress-bar progress-bar-success my_bar";
			document.getElementById("bar_two").className="progress-bar progress-bar-info my_bar";
			document.getElementById("bar_three").className="progress-bar progress-bar-warning  my_bar"
			document.getElementById("bar_four").className="progress-bar progress-bar-danger  my_bar"
		}
		//pauses the timer if it was running.
		function pause_timer()
		{	if(play_state==1 ||  play_state==-1)
			{
			play_state=0;
			clearInterval(my_timer);
			reset_progress_bar();
			remove_active_of_progressbar();
			}
		}

		//reset the progress bar to 100 points
		 function reset_progress_bar(){
 			//clearInterval(my_timer);
 			
			document.getElementById("bar_two").style.width="28%";
			document.getElementById("bar_three").style.width="28%";
			document.getElementById("bar_one").style.width="28%";
			document.getElementById("bar_four").style.width="16%";
		 }
		//Filp the image div and set the new  image for new word.
		function show_word()
		{
			var hint_place=document.getElementById("hint_place");
			flip(hint_place,"hint");
			show_hint(3);
			pause_it();
			play_state=-1;
			setTimeout(function(){play_state=0;hide_hint();var e=document.getElementById("play_pause_btn");e.disabled=false;play_it();},3000);
		}

		//Resumes the game, prepare the board again, and starts the timer.
		 function play_it()
		 {
		 	start_timer();

		 	prepare_board_for_next();
		 		
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
		 	if(play_state!=-1){
		 		var e=document.getElementById("play_pause_btn");
		 		if(play_state==0)
		 		{	
		 			flip(e,"btn_play")
		 			e.innerHTML=' <font size="5px"><span class="glyphicon glyphicon-pause" ></span><font color="#2E2E2E">Pause</font></font>';
		 			play_it();	
		 			
		 		}	
		 		else
		 		{
		 			flip(e,"btn_pause")
		 			e.innerHTML='<font size="5px"><span class="glyphicon glyphicon-play" ></span><font color="#2E2E2E">Play</font></font>';
		 			pause_it();
		 		}
		 	}
		 	else
		 	{
		 		console.log("Sorry can not perform playpause!! Game is in sleep mode")
		 	}
		 }


		 //If game is in playing mode. It Displays a correct word on hint tile. 
		 //If game is paused , Game is not suppose to showup a word.
		 function show_hint(seconds)
		 {	
		 	var e=document.getElementById("hint_place");		 		
		 
		 	if(play_state!=0 && perfect_word!=null) 
		 	{	e.style.lineHeight="40px";
		 		e.innerHTML='<font size="5px" color="silver">Word is:</font><br/><font size="8px" color="white"><b>'+perfect_word+'</b></font>';
			}
		 	else if(play_state==0)
		 	{
		 	e.style.lineHeight="40px";
		 	e.innerHTML="<font size='5px' color='white'><br/>Game Paused <br/><small>Click 'play' button to resume</small></font>";
		 	}
			setTimeout(function(){hide_hint();},(seconds)*1000);
		 }

		 //Flip the hint tile and hide the hint on it.
		 function hide_hint()
		 {
		 	if(play_state!=-1)
		 	{
			var e=document.getElementById("hint_place");
			e.style.lineHeight="20px";
		 	e.innerHTML='<font size="4px" color="silver"><p style="margin-bottom:5px;">Spell a word that stands for following meaning</font><br/></p><font size="5px" color="white">'+mean_list[current_word_number-1]+'</font><font color="#e1e1e1" size="4px"><br/><div id="show_hint_div class="show_word_box"> <button id="show_word_box" type="button" class="btn btn-warning btn-lg show_word_box" " onclick="show_hint(3);" onmouseover="show_hint(3)"><font size="4px><span class="glyphicon glyphicon-info-sign" ></span><font color="#2E2E2E">Find your word here...</font></font></button></div>';		 	
		 	flip(e,"hint");

		 	}
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
 				   update_score();
                   prepare_board_for_next();
                   char_time_end=total_time;

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
 			play_state=-1;
 			document.getElementById("play_pause_btn").disabled=true;
 			word_time=0;
 			word_score=0;
 			//console.log("Word index is "+current_word_number);
 			if(current_word_number==word_list.length)
 				terminate();
 			//start_timer();
		  	perfect_word=word_list[current_word_number++].trim().toUpperCase();
		  	update_word_count();
		  	show_word();
		  	current_character_number=0;
 		}

 		
 		//updates the word count on Word count
 		function update_word_count()
 		{
 			var e=document.getElementById("div_rb_counter");
 			flip(e,"word_conter");
 			e.innerHTML='<font color="gray" size="3px">Word</font><font size="6px" color="#404040"> '+current_word_number+'</font><font size="5px" color="gray">/'+word_list.length+'</font></div>';
 		}

 		//Start up the game, and changes the button with display name "Terminate"
 		function start()
 		{	pause_timer();
 			total_score=0;
 			var e=document.getElementById("div_rb_start");
 				e.disabled=true;
 				document.getElementById("quit_btn").disabled=false;
 				flip(e,"btn_start");
 				console.log("Started");
 				load_word();
 		}

 		//Terminates the running game and shows the score on alert,finally reloads the page
 		function terminate()
 		{
 			alert("Your word_score is:"+total_score);
 			location.reload();
 		}

 		
 		//apllies hover effect to child
 		function child_hover(e)
 		{
 			if(play_state==1)
 			{
 				e.style.color="#E2E2E2";
 				e.style['-webkit-box-shadow'] = "2px 2px 3px #2E2e2e";
 			}
 		}	

 		//Removes the hover effect after mouse is out
 		function child_mouse_out(e)
 		{
 	
 				e.style.color="white";	
 				e.style.textDecoration='none';
 				e.style['-webkit-box-shadow'] = "none";

 			
 		}
		
		//set the progress bar as per the time goes on.
		function update_progress_bar()
			{
				var diff=total_time-char_time_begin;
				var bar,percent;
				if(diff<18)
				{
					bar=document.getElementById("bar_one");
					document.getElementById("bar_two").style.width="28%";
					document.getElementById("bar_three").style.width="28%";
					percent=30*(17-diff)/18;
					console.log(percent);
					bar.style.width=percent+"%";
				}
				else if(diff<=36)
				{
					diff=diff-18;
					bar=document.getElementById("bar_two");
					document.getElementById("bar_three").style.width="28%";
					percent=30*(18-diff)/18;
					bar.style.width=percent+"%";
				}

				else if(diff<=54)
				{
					diff=diff-36;
					bar=document.getElementById("bar_three");
					percent=30*(18-diff)/18;
					bar.style.width=percent+"%";
				}
			}