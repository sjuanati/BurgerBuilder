import React, { Component } from 'react';
import { connect } from 'react-redux';

import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Aux from '../../hoc/Aux/Aux';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import * as burgerBuilderActions from '../../store/actions/index';

class BurgerBuilder extends Component {

    state = {
        purchasing: false,      // To show/hide modal
        loading: false,         // To show spinner
        error: false            // To render different content
    }

    componentDidMount () {
        console.log(this.props);
        // axios.get('https://react-burger-d867c.firebaseio.com/ingredients.json')
        //     .then(response => {
        //         this.setState({ingredients: response.data});
        //     })
        //     .catch(error => {
        //         this.setState({error: true})
        //     });
    }

    updatePurchaseState (ingredients) {

        // Insted of this, better to send 'ingredients' as parameter to get the latest version
        // Otherwise, it is only updated when a second ingredient is added.
        // const ingredients = {
        //     ...this.state.ingredients
        // };

        // Create an array of string entries (salad, meat..) returning the amounts for each key
        const sum = Object.keys(ingredients)
        .map(ingKey => {
            return ingredients[ingKey]
        })
        // Sum of all ingredients
        .reduce((sum, el) => {
            return sum + el;
        }, 0)
        return sum > 0;
    }

    // This won't work because only arrow functions capture the state values
    // purchaseHandler () {
    //     this.setState({purchasing: true})
    // }

    purchaseHandler = () => {
        this.setState({purchasing: true});
    }

    purchasedCancelHandler = () => {
        this.setState({purchasing: false})
    }

    purchaseContinueHandler = () => {
        this.props.history.push('/checkout');
    }

    render() {
        const disabledInfo = {
            ...this.props.ings
        };

        for (let key in disabledInfo) {
            // disable if value is <= 0
            disabledInfo[key] = disabledInfo[key] <= 0
        } // structure will be something like:  {salad: true, meat: false ...}

        let orderSummary = null; 
        let burger = this.state.error ? <p> Ingredients can't be loaded :( </p> : <Spinner />

        if (this.props.ings) {
            burger = (
                <Aux>
                    <Burger ingredients={this.props.ings} />
                    <BuildControls 
                        ingredientAdded={this.props.onIngredientAdded} 
                        ingredientRemoved={this.props.onIngredientRemoved}
                        disabled={disabledInfo}
                        purchasable={this.updatePurchaseState(this.props.ings)}
                        ordered={this.purchaseHandler}
                        price={this.props.price} />
                </Aux>
            );
            orderSummary = <OrderSummary 
                ingredients={this.props.ings}
                price={this.props.price} 
                purchaseCancelled={this.purchasedCancelHandler}
                purchaseContinued={this.purchaseContinueHandler} />
        }

        if (this.state.loading) {
            orderSummary = <Spinner />
        }

        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchasedCancelHandler}> 
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
        );
    }
}

const mapStateToProps = state => {
    return {
        ings: state.ingredients,
        price: state.totalPrice
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onIngredientAdded: (ingName) => dispatch(burgerBuilderActions.addIngredient(ingName)),
        onIngredientRemoved: (ingName) => dispatch(burgerBuilderActions.removeIngredient(ingName))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(BurgerBuilder, axios));