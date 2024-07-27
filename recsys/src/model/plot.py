import matplotlib.pyplot as plt
import pandas as pd

# Example preference data for demonstration
roommate_preferences = [
    {'get_up': 1, 'go_to_bed': 3, 'cleanliness': 2, 'smoker': 1, 'alcohol': 3, 'food_choice': 2, 'noise_level': 1,
     'pets': 0, 'share_with': 3, 'property_type': 1, 'stay_duration': 4},
    {'get_up': 2, 'go_to_bed': 1, 'cleanliness': 2, 'smoker': 1, 'alcohol': 2, 'food_choice': 3, 'noise_level': 2,
     'pets': 1, 'share_with': 2, 'property_type': 2, 'stay_duration': 3},
    {'get_up': 3, 'go_to_bed': 4, 'cleanliness': 4, 'smoker': 0, 'alcohol': 1, 'food_choice': 1, 'noise_level': 3,
     'pets': 1, 'share_with': 1, 'property_type': 3, 'stay_duration': 2},
    {'get_up': 2, 'go_to_bed': 2, 'cleanliness': 3, 'smoker': 1, 'alcohol': 2, 'food_choice': 1, 'noise_level': 4,
     'pets': 2, 'share_with': 3, 'property_type': 4, 'stay_duration': 1}
]

property_preferences = [
    {'get_up': 1, 'go_to_bed': 3, 'cleanliness': 2, 'smoker': 1, 'alcohol': 3, 'food_choice': 2, 'noise_level': 1,
     'pets': 0, 'share_with': 3, 'property_type': 1, 'stay_duration': 4},
    {'get_up': 2, 'go_to_bed': 2, 'cleanliness': 4, 'smoker': 0, 'alcohol': 1, 'food_choice': 1, 'noise_level': 3,
     'pets': 2, 'share_with': 1, 'property_type': 3, 'stay_duration': 1},
    {'get_up': 3, 'go_to_bed': 4, 'cleanliness': 3, 'smoker': 1, 'alcohol': 2, 'food_choice': 3, 'noise_level': 2,
     'pets': 1, 'share_with': 2, 'property_type': 2, 'stay_duration': 3},
    {'get_up': 4, 'go_to_bed': 1, 'cleanliness': 2, 'smoker': 1, 'alcohol': 2, 'food_choice': 1, 'noise_level': 4,
     'pets': 1, 'share_with': 3, 'property_type': 4, 'stay_duration': 2}
]

# Convert to DataFrames
rm_preferences_df = pd.DataFrame(roommate_preferences)
pr_preferences_df = pd.DataFrame(property_preferences)

# Calculate mean preferences
mean_rm_preferences = rm_preferences_df.mean()
mean_pr_preferences = pr_preferences_df.mean()

# Set up the figure for horizontal bar plots
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 8))

# Plotting roommate preferences
ax1.barh(mean_rm_preferences.index, mean_rm_preferences, color='skyblue', label='Roommate Preferences')

# Plotting property preferences
ax2.barh(mean_pr_preferences.index, mean_pr_preferences, color='salmon', label='Property Preferences')

# Adding labels, title, and legend to subplot 1
ax1.set_xlabel('Mean Values')
ax1.set_title('Roommate Preferences')
ax1.xaxis.grid(True, linestyle='--', which='both', color='gray', linewidth=0.5)

# Adding labels, title, and legend to subplot 2
ax2.set_xlabel('Mean Values')
ax2.set_title('Property Preferences')
ax2.xaxis.grid(True, linestyle='--', which='both', color='gray', linewidth=0.5)

# Adjust layout and spacing
plt.tight_layout()

# Show plot
plt.show()
