import React, { useState } from 'react';
import countries from './countries';
import validator from 'validator';

const PersonFormComponent = () => {
    const [formData, setFormData] = useState([
        {
            id: 1,
            name: '',
            dob: '',
            country: '',
            errors: { name: false, dob: false, country: false }
        }
    ]);
    const [formStatus, setFormStatus] = useState(null); // To track form status: success or error
    const [isLoading, setIsLoading] = useState(false); // To track API call loading state
    const [matches, setMatches] = useState([]); // To store matches found in the API response

    // Handle input changes
    const handleInputChange = (e, id, field) => {
        setFormStatus(null);
        setMatches([]);

        const updatedFormData = formData.map((item) => {
            if (item.id === id) {
                return { ...item, [field]: e.target.value };
            }
            return item;
        });
        setFormData(updatedFormData);
    };

    // Validate inputs
    const validateFormData = () => {
        let isValid = true;

        const updatedFormData = formData.map((item) => {
            const errors = { name: false, dob: false, country: false };

            if (!item.name) {
                errors.name = true;
                isValid = false;
            }

            if (!item.dob || !validator.isDate(item.dob)) {
                errors.dob = true;
                isValid = false;
            }

            if (!item.country || !countries.find((country) => country === item.country)) {
                errors.country = true;
                isValid = false;
            }

            return { ...item, errors };
        });

        setFormData(updatedFormData);
        return isValid;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!validateFormData()) return;

        // Set loading state to true
        setIsLoading(true);

        try {
            // Make API call
            const response = await fetch('http://localhost:8000/api/v1/screen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: [JSON.stringify(formData)],
            });

            if (!response.ok) {
                throw new Error('Failed to reach the SDN Screener endpoint.');
            }

            // Parse JSON response
            const data = await response.json();

            // Extract matches from response
            const foundMatches = data
                .filter(item => item.name_match || item.dob_match || item.country_match)
                .map(item => {
                    const matches = [];
                    if (item.name_match) matches.push('Name');
                    if (item.dob_match) matches.push('DOB');
                    if (item.country_match) matches.push('Country');
                    return matches.join(', ');
                });

            // Set matches found
            setMatches(foundMatches);

            // Handle success
            setFormStatus('success');
        } catch (error) {
            // Handle error
            console.error('Error submitting form:', error);
            setFormStatus('error');
        } finally {
            // Set loading state to false after API call completes
            setIsLoading(false);
        }
    };

    // Render matching message
    const renderMatchingMessage = () => {
        if (matches.length > 0) {
            return <p className="form-status success">Found matches: {matches.join(', ')}</p>
        }

        return <p className="form-status error">No matches found</p>
    }

    // Render
    return (
        <div className='form-container'>
            {formStatus == 'success' && renderMatchingMessage()}
            {formStatus === 'error' && <p className="form-status error">Failed to submit form. Please try again.</p>}
            <form onSubmit={handleSubmit}>
                {formData.map((item) => (
                    <div key={item.id} className='form-group'>
                        <label htmlFor={`name-${item.id}`}>Name</label>
                        <input
                            type="text"
                            id={`name-${item.id}`}
                            name={`name-${item.id}`}
                            value={item.name}
                            onChange={(e) => handleInputChange(e, item.id, 'name')}
                            className={`form-control ${item.errors.name ? 'error' : ''}`}
                        />
                        <label htmlFor={`dob-${item.id}`}>Date of Birth</label>
                        <input
                            type="date"
                            id={`dob-${item.id}`}
                            name={`dob-${item.id}`}
                            value={item.dob}
                            onChange={(e) => handleInputChange(e, item.id, 'dob')}
                            className={`form-control ${item.errors.dob ? 'error' : ''}`}
                        />
                        <label htmlFor={`country-${item.id}`}>Country</label>
                        <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={(e) => handleInputChange(e, item.id, 'country')}
                            className={`form-control ${item.errors.country ? 'error' : ''}`}
                        >
                            <option value={'Placeholder'}>Select a country</option>
                            {countries.map((country, index) => (
                                <option key={index} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default PersonFormComponent;
