import { createContext, useReducer } from "react";

export const Store = createContext()

const initialState = {
    userInfoToken: localStorage.getItem('userInfoToken')
    ? JSON.parse(localStorage.getItem('userInfoToken'))
    : null,
    
    sale:{
        saleItems: localStorage.getItem('saleItems')
        ?JSON.parse(localStorage.getItem('saleItems'))
        :[],
        multipleSaleItems: localStorage.getItem('multipleSale')

    }


}


function reducer(state, action){
    switch(action.type){
        case 'SIGN_IN':
            return {...state, userInfoToken: action.payload}
        case 'SIGN_OUT':
            return { ...state, userInfoToken: null }      
        case 'ADD_SALE_ITEM':
            const newItem = action.payload;
            const existItem = state.sale.saleItems.find((item)=> item._id === newItem._id);
            const saleItems = existItem ? state.sale.saleItems.map(
            (item)=> item._id === existItem._id 
            ? newItem : item)
            : [...state.sale.saleItems, newItem]
            localStorage.setItem('saleItems', JSON.stringify(saleItems))
            return {...state, sale: {...state.sale, saleItems}}

        case 'REMOVE_SALE_ITEM':{
            const saleItems = state.sale.saleItems.filter((item)=> item._id !== action.payload._id)
            localStorage.setItem('saleItems', JSON.stringify(saleItems))
            return{...state, sale: {...state.sale, saleItems}}
        }

        case 'CLEAR_SALE_ITEMS':
            return{...state, sale: {...state.sale, saleItems:[]}}
            
        default:
            return state;   
    }
}




























export function StoreProvider(props){
    const [state, dispatch] = useReducer(reducer, initialState)
    const value = { state, dispatch};
    return <Store.Provider value={value}>{props.children}</Store.Provider>
}