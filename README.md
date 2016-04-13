# Turing Chat
Turing Chat is a social game developed for the GT College of Computing Imitation Game
public showing. 

## The Turing Test
Beside inventing the computer, Alan Turing also concieved of a way to 
test if a software program could be considered intelligent. His criteria was that, if a 
human could communicate with the program without being able to tell that the agent is
a computer, then the program can be considered intelligent.

## Playing
During the movie showing, players that opened the app were paired with either another
movie-goer at the showing, or an AI chatbot. Given twelve total messages, the player
must decide whether he or she is chatting with a human or an AI. 

![chatting with an AI or a human?](https://cloud.githubusercontent.com/assets/7738472/14504409/b5688b18-0182-11e6-8583-9913016c7f37.png)

On the home screen, players can track their score in comparison to the high scores.

![looking at high scores](https://cloud.githubusercontent.com/assets/7738472/14504408/b564d900-0182-11e6-969d-4e148bf82617.png)


## Development
The application was developed for both iOS and Android using the Ionic framework. The AI
was implemented as a standalone application that interfaces with the Firebase backend in 
the same way that this chat application does.

### Ionic
This application was developed on the Ionic platform, which is a UI framework build on top of
Cordova and Angular. It allows developers to create mobile applications using web technologies
by packaging the same web app into different application files for several platforms.

### Firebase
I used firebase for the backend to this application. Firebase's javascript API is especially
easy to use, and it allowed me to avoid writing any server code for this small project.
The AI chatbot could easily integrate with this firebase backend with only a little code.
