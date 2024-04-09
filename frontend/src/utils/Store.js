import { createContext, useReducer } from "react";
import { toast } from "react-toastify";





export const Store = createContext()

const initialState = {
    userInfoToken: localStorage.getItem('userInfoToken')
    ? JSON.parse(localStorage.getItem('userInfoToken'))
    : null,
    
    selectedItems: localStorage.getItem('selectedItems')
    ? JSON.parse(localStorage.getItem('selectedItems'))
    : [],

    selectedSale: localStorage.getItem('selectedSale')
    ? JSON.parse(localStorage.getItem('selectedSale'))
    : {},

    todaySales: localStorage.getItem('todaySales')
    ? JSON.parse(localStorage.getItem('todaySales')) 
    : [],
    }
    


function reducer(state, action){
    switch(action.type){
        case 'SIGN_IN':
            return {...state, userInfoToken: action.payload}
        case 'SIGN_OUT':
            return { ...state, userInfoToken: null }
        case "ADD_SELECTED_SALE":
            return {...state, selectedSale: action.payload}
        case "ADD_NEW_SALE":
            const sale = action.payload;
            const newSalesList = [...state.todaySales, sale]
            localStorage.setItem('todaySales', JSON.stringify(newSalesList))
            return {...state, todaySales: newSalesList}
        case 'ADD_SELECTED_ITEM':
            const newItem = action.payload;
            const existItem = state.selectedItems.find((item)=> item._id === newItem._id);
            if(existItem){
                toast.error('item already added')
                return {...state, selectedItems: state.selectedItems}
            }else{
                const updatedItems = [...state.selectedItems, newItem]
                localStorage.setItem('selectedItems', JSON.stringify(updatedItems))
                toast.success('unit added successfully')
                return {...state, selectedItems: updatedItems}
            }

        case 'REMOVE_SELECTED_ITEM': {
                return { ...state, selectedItems: action.payload};
            }
        case 'ADJUST_QTY':{
            const selectedItems = state.selectedItems.filter((item)=> item._id !== action.payload._id)
            localStorage.setItem('selectedItems', JSON.stringify(selectedItems))
            return{...state, selectedItems: {...state.selectedItems, selectedItems}}
        }

        case 'CLEAR_SELECTED_ITEMS':
            return{...state, selectedItems: {...state.selectedItems, selectedItems:[]}}
            
        default:
            return state;   
    }
}


export function StoreProvider(props){
    const [state, dispatch] = useReducer(reducer, initialState)
    const value = { state, dispatch};
    return <Store.Provider value={value}>{props.children}</Store.Provider>
}