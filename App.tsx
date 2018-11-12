import React, { Component } from 'react';
import { Button, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Answer, Question } from "../kvizapi/src";

class AnswerInput extends React.Component<{
    onAnswerChange: (text: string) => void,
    answer: string,
    isCorrect: boolean,
    changeCorrect: (isCorrect: boolean) => void
}> {
    render() {
        return <View>
            <Text>Zadajte odpoveď</Text>
            <TextInput onChangeText={this.props.onAnswerChange} value={this.props.answer}/>
            <Text>Správna?</Text>
            <Switch value={this.props.isCorrect} onValueChange={this.props.changeCorrect}/>
        </View>;
    }
}

class QuestionForm extends React.Component<{
    text: string,
    onTextChange: (text: string) => void
}> {
    state = {
        answers: [] as Answer[]
    };

    changeAnswer = (i: number, text: string) => {
        const {answers} = this.state;
        answers[i].text = text;
        this.setState({answers});
    };

    changeCorrect = (i: number, correct: boolean) => {
        const {answers} = this.state;
        answers[i].isCorrect = correct;
        this.setState({answers});
    };

    addAnswer = () => {
        this.setState({
            answers: [...this.state.answers, {
                text: '',
                isCorrect: false
            }]
        });
    };

    render() {
        return <View>
            <TextInput value={this.props.text} onChangeText={this.props.onTextChange}/>
            {this.state.answers.map((a, i) =>
                <AnswerInput key={i}
                             onAnswerChange={this.changeAnswer.bind(undefined, i)}
                             changeCorrect={this.changeCorrect.bind(undefined, i)}
                             isCorrect={this.state.answers[i].isCorrect}
                             answer={this.state.answers[i].text}/>)}
            <TouchableOpacity onPress={this.addAnswer}>
                <Text style={{color: 'black'}}>Pridať odpoveď</Text>
            </TouchableOpacity>
        </View>;
    }
}

class QuizForm extends React.Component {
    state = {
        questions: [] as Question[]
    };

    changeQuestion = (i: number, text: string) => {
        const {questions} = this.state;
        questions[i].text = text;
        this.setState({questions});
    };

    addQuestion = () => {
        this.setState({
            questions: [...this.state.questions, {
                text: ''
            }]
        });
    };

    render() {
        return <View style={{marginTop: 200}}>
            {this.state.questions.map((a, i) =>
                <QuestionForm key={i}
                              onTextChange={this.changeQuestion.bind(undefined, i)}
                              text={this.state.questions[i].text}/>)}
            <TouchableOpacity onPress={this.addQuestion}>
                <Text style={{color: 'black'}}>Pridať otázku</Text>
            </TouchableOpacity>
        </View>;
    }
}

export default class App extends Component {
    render() {
        return (
            <View>
                <QuizForm/>
            </View>
        );
    }
}
