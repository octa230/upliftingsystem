import React, {useEffect, useState} from 'react'
import { Card, Button } from 'react-bootstrap';

const Calculator = () => {


    const [input, setInput] = useState('0')

    const isLastCharOperator = (str) => /[+\-*/]$/.test(str);

    // Handle calc button clicks
    const handleCalcClick = (value) => {
        if (value === '=') {
            try {
                // Only evaluate if the expression is valid
                if (isLastCharOperator(input)) {
                    setInput('Error'); // Prevent evaluation if the last character is an operator
                } else {
                    setInput(eval(input).toString());
                }
            } catch (e) {
                setInput('Error');
            }
        } else if (value === 'C') {
            setInput('0'); // Reset input
        } else if (value === '.' && !input.includes('.')) {
            // Prevent adding multiple decimals
            setInput((prev) => prev + value);
        } else if (isLastCharOperator(input) && /[+\-*/]/.test(value)) {
            // Prevent appending an operator directly after another operator
            return;
        } else {
            setInput((prev) => (prev === '0' ? value : prev + value));
        }
    };

    // Handle keyboard input
    useEffect(() => {
        const handleKeydown = (event) => {
            const key = event.key;

            // Handle Backspace
            if (key === 'Backspace') {
                setInput((prev) => (prev.length === 1 ? '0' : prev.slice(0, -1))); // Remove the last character
            }

            // Handle calculator keys
            else if ('0123456789'.includes(key)) {
                handleCalcClick(key); // Numbers
            } else if ('+-*/'.includes(key)) {
                handleCalcClick(key); // Operators
            } else if (key === '.') {
                handleCalcClick('.'); // Decimal point
            } else if (key === 'Enter' || key === '=') {
                handleCalcClick('='); // Equals
            } else if (key === 'Escape' || key === 'C') {
                handleCalcClick('C'); // Clear
            }
        };

        // Add event listener when component mounts
        window.addEventListener('keydown', handleKeydown);

        // Cleanup the event listener when component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, [input]);
    return (
        <Card className='d-flex flex-column align-items-center justify-content-center p-2'>
            <Card.Header className='w-100 text-center border rounded text-success mb-3'>
                <h6>{input}</h6>
            </Card.Header>
            <Card.Body className='w-100 d-flex flex-wrap justify-content-center p-0 gap-2'>
                {[
                    '7', '8', '9', '/',
                    '4', '5', '6', '*',
                    '1', '2', '3', '-',
                    '0', '.', '=', '+',
                    'C', '00', '000'
                ].map((btn) => (
                    <Button
                        variant='outline-danger'
                        key={btn}
                        onClick={() => handleCalcClick(btn)}
                        className='w-25'
                        style={{ minWidth: '40px', fontSize: '1.5rem' }}
                    >
                        {btn}
                    </Button>
                ))}
            </Card.Body>
        </Card>
    )
}

export default Calculator
