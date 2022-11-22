import gc

gc.collect()

# DEVELOPMENT_MODE = False

# import webrepl_setup

# if DEVELOPMENT_MODE:
#     print("Enabling webrepl.")
#     import webrepl # type: ignore
#     webrepl.start()
#     print("webrepl enabled.")

print('Boot started.')  # type: ignore

# mac_addr = station.config('mac')
# print(f'Mac address : {ubinascii.hexlify(mac_addr).decode()}')

print('Boot completed.')
