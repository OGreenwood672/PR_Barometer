from math import pow

T0 = 288.15  # Standard temperature at sea level in Kelvin
L = 0.0065   # Temperature lapse rate in K/m
P0 = 101325  # Standard atmospheric pressure at sea level in Pascals
R = 8.314    # Universal gas constant in J/(mol·K)
g = 9.80665  # Acceleration due to gravity in m/s²
# M = 0.0289644  # Molar mass of dry air in kg/mol
humidity = 0.25
M = humidity * 0.0180 + (1 - humidity) * 0.0289644

dp = 100

p_example = 100600

k = R * L / (g * M)
coefficient = - (T0 * R) / (g * M * pow(P0, k))
dh = abs(coefficient * pow(p_example, k - 1)) * dp

print(dh)