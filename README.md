# simudyne-back-end-test

This repository contains the code for Simudyne's back-end test.

## Specifications

Download the source files, load the data into a program and run code on that data that follows this logic:

### Inputs

```
Brand_Factor = Values ranging from (0.1 -> 2.9)
```

### Running steps

For 15 years, in 1 year increments.

```
Age = Age + 1
If (Auto_Renew) { 
    // Do nothing, maintain Breed<
} else {
    double rand = Math.random() * 3;
    Affinity = Payment_at_Purchase/Attribute_Price + (rand * Attribute_Promotions * Inertia_for_Switch)
    If (Breed == Breed_C && Affinity < (Social_Grade * Attribute_Brand))
        Switch Breed to Breed_NC
    Else if (Breed == Breed_NC && Affinity < (Social_Grade * Attribute_Brand * Brand_Factor))
        Switch Breed to Breed_C
}
```

### Outputs

For every year, and final:

```
Breed_C Agents
Breed_NC Agents
Breed_C Lost (Switched to Breed_NC)
Breed_C Gained (Switch from Breed_NC)<
Breed_C Regained (Switched to NC, then back to C)
```

Use any framework or language you feel appropriate. Provide instructions on how to setup and run your project so that we can test it quickly. The test should be posted to a public repo with the instructions.

The test can be “solved” in under 1 hour. However, we recommend being creative with your submission. We are looking for submissions that show a good understanding of:

Program setup
Data and logic
The need for useful output and visualization
How to write good documentation and instructions
Robust and extendable code
Your solution doesn’t need to be perfect in all the above areas. It’s better in the time frame to focus on one aspect to show off your strengths. Following the test, there will be a code review that asks why you made the choices or tradeoffs you did, and what you think the next steps would be.

Hints and tips

Submissions could involve distributed computation, databases, web applications, Monte Carlo analysis, AI/ML, or other aspects beyond the problem itself to showcase a developer’s skillset and creativity.

Ultimately, we are looking for you to demonstrate your capabilities as a platform developer not to write a script that processes the input.

Good Luck!
